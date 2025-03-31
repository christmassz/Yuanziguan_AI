// calculate_mayer_multiple.js
const fs = require('fs');
const path = require('path');

// Function to convert Unix timestamp to readable date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Load the JSON data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'mayer-multiple.json'), 'utf8'));

// Sort data by timestamp (ascending) to ensure chronological order for SMA calculation
data.sort((a, b) => a.timestamp - b.timestamp);

// Calculate the 200-day moving average for each data point
console.log('Calculating 200-day moving average...');
const windowSize = 200;
const calculatedData = [];

for (let i = 0; i < data.length; i++) {
  const currentItem = { ...data[i] };
  
  // Add formatted date
  currentItem.date = formatDate(currentItem.timestamp);
  
  // For the first 200 days, we'll have a partial moving average (or null)
  if (i < windowSize - 1) {
    // Either use a partial average or leave as null
    const prices = data.slice(0, i + 1).map(item => item.price);
    const partialAvg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    currentItem.sma200d = partialAvg;
    currentItem.isSMA200Complete = false;
  } else {
    // Calculate full 200-day moving average
    const prices = data.slice(i - windowSize + 1, i + 1).map(item => item.price);
    const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    currentItem.sma200d = sma;
    currentItem.isSMA200Complete = true;
  }
  
  // Calculate the true Mayer Multiple
  if (currentItem.sma200d) {
    currentItem.mayerMultiple = currentItem.price / currentItem.sma200d;
  } else {
    currentItem.mayerMultiple = null;
  }
  
  // Keep track of the original index and fourYearPrice for comparison
  currentItem.originalIndex = currentItem.index;
  currentItem.originalReferencePrice = currentItem.fourYearPrice;
  
  calculatedData.push(currentItem);
}

// Compare the calculated Mayer Multiple with the original index
console.log('\nComparing original index with calculated Mayer Multiple:');
// Only show comparisons for data points with complete 200-day window
const completeDataSamples = calculatedData.filter(item => item.isSMA200Complete).slice(-5);
completeDataSamples.forEach((item, i) => {
  console.log(`Record ${i} (${item.date}):`);
  console.log(`  Price: ${item.price}`);
  console.log(`  Calculated 200-day SMA: ${item.sma200d.toFixed(2)}`);
  console.log(`  Original fourYearPrice: ${item.fourYearPrice.toFixed(2)}`);
  console.log(`  Original index: ${item.originalIndex.toFixed(4)}`);
  console.log(`  Calculated Mayer Multiple: ${item.mayerMultiple.toFixed(4)}`);
  console.log(`  Ratio (original/calculated): ${(item.originalIndex / item.mayerMultiple).toFixed(4)}`);
});

// Save the calculated data to JSON
fs.writeFileSync('corrected-mayer-multiple.json', JSON.stringify(calculatedData, null, 2));
console.log('\nSaved corrected data to corrected-mayer-multiple.json');

// Create CSV file
const headers = [
  'date', 'price', 'sma200d', 'mayerMultiple', 
  'originalIndex', 'fourYearPrice', 'timestamp'
];

let csvContent = headers.join(',') + '\n';

calculatedData.forEach(item => {
  const row = headers.map(header => {
    if (header === 'date') return item.date;
    
    // Format numbers to prevent too many decimal places
    if (typeof item[header] === 'number') {
      if (header.toLowerCase().includes('price')) {
        return item[header].toFixed(2); // 2 decimal places for prices
      } else if (header.includes('Multiple') || header.includes('index')) {
        return item[header].toFixed(4); // 4 decimal places for indices
      }
    }
    
    return item[header];
  });
  
  csvContent += row.join(',') + '\n';
});

fs.writeFileSync('corrected-mayer-multiple.csv', csvContent);
console.log('Saved corrected data to corrected-mayer-multiple.csv');

// Also create a simplified version with just the essential fields
const simplifiedData = calculatedData
  .filter(item => item.isSMA200Complete) // Only include complete SMA data
  .map(item => ({
    date: item.date,
    price: item.price,
    sma200d: item.sma200d,
    mayerMultiple: item.mayerMultiple
  }));

fs.writeFileSync('simplified-mayer-multiple.json', JSON.stringify(simplifiedData, null, 2));
fs.writeFileSync('simplified-mayer-multiple.csv', 
  'date,price,sma200d,mayerMultiple\n' + 
  simplifiedData.map(item => 
    `${item.date},${item.price.toFixed(2)},${item.sma200d.toFixed(2)},${item.mayerMultiple.toFixed(4)}`
  ).join('\n')
);

console.log('Saved simplified data to simplified-mayer-multiple.json and simplified-mayer-multiple.csv');
console.log('\nAll done!');
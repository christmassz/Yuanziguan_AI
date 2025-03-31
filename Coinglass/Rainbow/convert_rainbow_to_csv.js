// convert_rainbow_to_csv.js
const fs = require('fs');
const path = require('path');

// File paths
const inputFile = '/Users/jo/Desktop/Work/JL Capital/AI/Coinglass/rainbow/rainbow-data.json';
const outputFile = '/Users/jo/Desktop/Work/JL Capital/AI/Coinglass/rainbow/rainbow-data-readable.csv';

// Function to convert Unix timestamp to YYYY-MM-DD format
function formatDate(timestamp) {
  // Check if timestamp is in milliseconds or seconds
  const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

try {
  // Read and parse the JSON file
  console.log(`Reading data from ${inputFile}...`);
  const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  if (!Array.isArray(jsonData)) {
    console.error('Expected JSON data to be an array');
    process.exit(1);
  }
  
  console.log(`Found ${jsonData.length} data points`);
  
  // Define custom headers for the CSV
  const customHeaders = [
    'BTC price', 'fire sale', 'buy', 'accumulate', 'still cheap',
    'hold', 'bubble forming', 'fomo', 'sell', 'max bubble', 'date'
  ];
  
  // Filter out incomplete data
  const filteredData = jsonData.filter(item => 
    Array.isArray(item) && item.length >= 11 && !item.some(val => val === null || val === undefined || val === '')
  );
  
  console.log(`Filtered to ${filteredData.length} data points with complete information`);
  
  // Create CSV content with custom headers
  let csvContent = customHeaders.join(',') + '\n';
  
  // Convert each data point to a CSV row
  filteredData.forEach((item, index) => {
    // The last item might be a timestamp
    let date = 'N/A';
    let dataItems = [...item]; // Copy the array
    
    // Check if the last item looks like a timestamp
    if (dataItems.length > 11 && typeof dataItems[dataItems.length - 1] === 'number' && dataItems[dataItems.length - 1] > 10000000000) {
      try {
        date = formatDate(dataItems[dataItems.length - 1]);
        // Remove the timestamp from the data items
        dataItems.pop();
      } catch (e) {
        console.error(`Error formatting date at index ${index}:`, e.message);
      }
    }
    
    // Remove the second column (index 1) and format numbers to fixed decimal places 
    const formattedItems = dataItems
      .filter((_, i) => i !== 1) // Remove the second column
      .slice(0, 10) // Take only 10 items (since we removed one)
      .map((value, i) => {
        if (typeof value === 'number') {
          return value.toFixed(2);
        }
        return value;
      });
    
    // Add the date at the end
    formattedItems.push(date);
    
    // Add the row to CSV content
    csvContent += formattedItems.join(',') + '\n';
  });
  
  // Write CSV to file
  fs.writeFileSync(outputFile, csvContent);
  console.log(`Successfully converted data to CSV: ${outputFile}`);
  
  // Basic statistics for confirmation
  console.log(`\nData Summary:`);
  console.log(`Total records: ${filteredData.length}`);
  
  // Only try to show date range if we can format the dates properly
  try {
    if (filteredData.length > 0) {
      const firstTimestamp = filteredData[0][filteredData[0].length - 1];
      const lastTimestamp = filteredData[filteredData.length - 1][filteredData[filteredData.length - 1].length - 1];
      
      if (typeof firstTimestamp === 'number' && typeof lastTimestamp === 'number') {
        console.log(`Date range: ${formatDate(firstTimestamp)} to ${formatDate(lastTimestamp)}`);
      }
    }
  } catch (e) {
    console.error("Couldn't determine date range:", e.message);
  }
  
} catch (error) {
  console.error(`Error converting data: ${error.message}`);
}
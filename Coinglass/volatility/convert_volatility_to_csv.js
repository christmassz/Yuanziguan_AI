const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'volatility-data.json');
const csvFilePath = path.join(__dirname, 'volatility-data-readable.csv');

try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  const data = JSON.parse(rawData);
  
  // Create CSV content with header
  let csvContent = 'Date,Volatility Index\n';
  
  // Process each timestamp and corresponding volatility index
  if (data.time && data.bl && data.time.length === data.bl.length) {
    for (let i = 0; i < data.time.length; i++) {
      const timestamp = data.time[i];
      const volatilityIndex = data.bl[i];
      
      // Convert timestamp to date
      const date = new Date(timestamp);
      const dateStr = date.toISOString().split('T')[0];
      
      // Add to CSV
      csvContent += `${dateStr},${volatilityIndex}\n`;
    }
  } else {
    console.error('Data arrays have different lengths or are missing');
    return;
  }
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
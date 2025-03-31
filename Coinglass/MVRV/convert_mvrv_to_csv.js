// convert_mvrv_to_csv.js
const fs = require('fs');
const path = require('path');

// File paths
const inputFile = '/Users/jo/Desktop/Work/JL Capital/AI/Coinglass/MVRV/mvrv-data.json';
const outputFile = '/Users/jo/Desktop/Work/JL Capital/AI/Coinglass/MVRV/mvrv-data-readable.csv';

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
  
  // Determine the headers from the first item in the array
  const firstItem = jsonData[0];
  const headers = Object.keys(firstItem);
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  // Convert each data point to a CSV row
  jsonData.forEach((item) => {
    const row = headers.map(header => {
      // Format timestamp fields to YYYY-MM-DD
      if (
        (header.toLowerCase().includes('time') || header.toLowerCase().includes('date')) && 
        typeof item[header] === 'number'
      ) {
        return formatDate(item[header]);
      }
      
      // Format numbers to fixed decimal places for readability
      if (typeof item[header] === 'number') {
        // Price values generally need 2 decimal places
        if (header.toLowerCase().includes('price')) {
          return item[header].toFixed(2);
        }
        // Ratio values generally need 4 decimal places
        else if (header.toLowerCase().includes('ratio') || header.toLowerCase().includes('mvrv')) {
          return item[header].toFixed(4);
        }
        // Other numbers with 2 decimal places for general readability
        return item[header].toFixed(2);
      }
      
      return item[header];
    });
    
    csvContent += row.join(',') + '\n';
  });
  
  // Write CSV to file
  fs.writeFileSync(outputFile, csvContent);
  console.log(`Successfully converted data to CSV: ${outputFile}`);
  
  // Basic statistics for confirmation
  console.log(`\nData Summary:`);
  console.log(`Total records: ${jsonData.length}`);
  console.log(`Date range: ${formatDate(jsonData[0].timestamp || jsonData[0].date)} to ${formatDate(jsonData[jsonData.length-1].timestamp || jsonData[jsonData.length-1].date)}`);
  
} catch (error) {
  console.error(`Error converting data: ${error.message}`);
}
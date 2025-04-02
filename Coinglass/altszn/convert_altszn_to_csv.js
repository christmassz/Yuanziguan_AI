const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'altszn-data.json');
const csvFilePath = path.join(__dirname, 'altszn-data-readable.csv');

try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  
  // Parse the JSON
  let data;
  try {
    data = JSON.parse(rawData);
    console.log("JSON parsed successfully");
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    return;
  }
  
  // Make sure we have an array to work with
  if (!Array.isArray(data)) {
    console.log("JSON is not an array, trying to extract array...");
    if (data.data && Array.isArray(data.data)) {
      data = data.data;
    } else {
      data = [data];
    }
  }
  
  console.log(`Found ${data.length} data points`);
  
  // Create CSV content with header
  let csvContent = 'Date,Altcoin Index\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (!item.timestamp) {
      console.warn(`Item ${i} missing timestamp, skipping`);
      return;
    }
    
    // Convert timestamp to date (timestamp is in milliseconds)
    const date = new Date(item.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get altcoin index
    const altcoinIndex = item.altcoinIndex !== undefined ? item.altcoinIndex : 'Unknown';
    
    // Add to CSV
    csvContent += `${dateStr},${altcoinIndex}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'puell-data.json');
const csvFilePath = path.join(__dirname, 'puell-data-readable.csv');

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
    if (data.data && Array.isArray(data.data)) {
      data = data.data;
    } else {
      data = [data];
    }
  }
  
  // Create CSV content with header
  let csvContent = 'Date,Puell Multiple\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (!item.createTime) {
      console.warn(`Item ${i} missing createTime, skipping`);
      return;
    }
    
    // Convert timestamp (milliseconds) to date
    const date = new Date(item.createTime);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get Puell Multiple value
    const puellMultiple = item.puellMultiple !== undefined ? item.puellMultiple : 'Unknown';
    
    // Add to CSV
    csvContent += `${dateStr},${puellMultiple}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
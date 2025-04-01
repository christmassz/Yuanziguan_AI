const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'nupl-data.json');
const csvFilePath = path.join(__dirname, 'nupl-data-readable.csv');

try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  
  // Log the first bit of the file to see what we're dealing with
  console.log("First 100 characters of JSON:", rawData.substring(0, 100));
  
  // Parse the JSON - trying with simple array first
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
    // Check if this is an object with a data property
    if (data.data && Array.isArray(data.data)) {
      data = data.data;
    } else {
      // Last resort - wrap it as a single-item array
      data = [data];
    }
  }
  
  console.log(`Found ${data.length} data points`);
  
  // Create CSV content with header
  let csvContent = 'Date,nupl Index\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (i === 0) {
      console.log("First item structure:", JSON.stringify(item));
    }
    
    if (!item.timestamp) {
      console.warn(`Item ${i} missing timestamp, skipping`);
      return;
    }
    
    // Convert timestamp to date
    const date = new Date(item.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get nupl index - use the index field instead of escapeIndex
    const nuplIndex = item.index !== undefined ? item.index : 'Unknown';
    
    // Add to CSV
    csvContent += `${dateStr},${nuplIndex}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
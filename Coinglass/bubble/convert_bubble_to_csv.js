const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'bubble-data.json');
const csvFilePath = path.join(__dirname, 'bubble-data-readable.csv');

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
  
  // Create CSV content with header - include all required fields
  let csvContent = 'Date,BTC Price,Bubble Index,Google Trends,Difficulty,Transactions,Sent By Address,Tweets\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (i === 0) {
      console.log("First item structure:", JSON.stringify(item));
    }
    
    // Get the date (using 'time' field instead of 'timestamp')
    if (!item.time) {
      console.warn(`Item ${i} missing time field, skipping`);
      return;
    }
    
    // Map fields from the actual JSON structure to our CSV fields
    const dateStr = item.time;
    const btcPrice = item.price !== undefined ? item.price : '';
    const bubbleIndex = item.index !== undefined ? item.index : '';
    const googleTrends = item.gt !== undefined ? item.gt : '';
    const difficulty = item.bd !== undefined ? item.bd : '';
    const transactions = item.ts !== undefined ? item.ts : '';
    const sentByAddress = item.sba !== undefined ? item.sba : '';
    const tweets = item.bt !== undefined ? item.bt : '';
    
    // Add to CSV
    csvContent += `${dateStr},${btcPrice},${bubbleIndex},${googleTrends},${difficulty},${transactions},${sentByAddress},${tweets}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
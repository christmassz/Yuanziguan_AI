const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 's2f-data.json');
const csvFilePath = path.join(__dirname, 's2f-data-readable.csv');

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
  let csvContent = 'Date,BTC Price,Stock/Flow,Model Variance\n';
  
  // Filter to complete rows only
  let completeRows = 0;
  
  // Process each item
  data.forEach((item, i) => {
    // Skip items without timestamp
    if (!item.createTime && !item.timestamp) {
      return;
    }
    
    // Skip if any of the required fields are missing
    if (item.price === undefined || 
        (item.stockFlow365dAverage === undefined && 
        item.stockToFlow === undefined && 
        item.s2f === undefined && 
        item.stock_to_flow === undefined) ||
        (item.modelVariance === undefined && 
        item.variance === undefined)) {
      return;
    }
    
    // Convert timestamp to date
    const timestamp = item.createTime || item.timestamp;
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get BTC price
    const price = item.price;
    
    // Get Stock/Flow value - check for all possible field names
    const stockToFlow = item.stockFlow365dAverage || item.stockToFlow || item.s2f || item.stock_to_flow;
    
    // Get Model Variance
    const modelVariance = item.modelVariance || item.variance;
    
    // Add to CSV
    csvContent += `${dateStr},${price},${stockToFlow},${modelVariance}\n`;
    completeRows++;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  console.log(`Included ${completeRows} complete rows with all four values.`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
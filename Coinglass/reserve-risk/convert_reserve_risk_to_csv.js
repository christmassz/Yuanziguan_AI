const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'reserve_risk-data.json');
const csvFilePath = path.join(__dirname, 'reserve_risk-data-readable.csv');

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
    console.error("JSON is not an array");
    return;
  }
  
  console.log(`Found ${data.length} data points`);
  
  // Create CSV content with header
  let csvContent = 'Date,VOCD,Reserve Risk Index,HODL Bank,MVOCD\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (!item.timestamp) {
      console.warn(`Item ${i} missing timestamp, skipping`);
      return;
    }
    
    // Convert timestamp to date
    const date = new Date(item.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get all required values, using 'Unknown' as fallback
    const vocd = item.vocd !== undefined ? item.vocd : 'Unknown';
    const reserveRiskIndex = item.reserveRiskIndex !== undefined ? item.reserveRiskIndex : 'Unknown';
    const hodlBank = item.hodlBank !== undefined ? item.hodlBank : 'Unknown';
    const movcd = item.movcd !== undefined ? item.movcd : 'Unknown';
    
    // Add to CSV, using fixed decimal places for better readability
    csvContent += `${dateStr},${Number(vocd).toFixed(8)},${Number(reserveRiskIndex).toFixed(8)},${Number(hodlBank).toFixed(8)},${Number(movcd).toFixed(8)}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
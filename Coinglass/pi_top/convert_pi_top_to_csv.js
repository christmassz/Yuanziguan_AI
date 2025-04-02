const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'pi_top-data.json');
const csvFilePath = path.join(__dirname, 'pi_top-data-readable.csv');

try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf8');
  
  // Log the first bit of the file to see what we're dealing with
  console.log("First 100 characters of JSON:", rawData.substring(0, 100));
  
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
  let csvContent = 'Date,MA110,MA350MU2,Distance_To_Top_Pct\n';
  
  // Process each item
  data.forEach((item, i) => {
    if (i === 0) {
      console.log("First item structure:", JSON.stringify(item));
    }
    
    if (!item.createTime) {
      console.warn(`Item ${i} missing timestamp, skipping`);
      return;
    }
    
    // Convert timestamp to date
    const date = new Date(item.createTime);
    const dateStr = date.toISOString().split('T')[0];
    
    // Get MA values
    const ma110 = item.ma110 || 'Unknown';
    const ma350mu2 = item.ma350Mu2 || 'Unknown';
    
    // Calculate distance to top as percentage
    let distanceToTopPct = 'Unknown';
    if (ma110 !== 'Unknown' && ma350mu2 !== 'Unknown') {
      const ma110Value = parseFloat(ma110);
      const ma350mu2Value = parseFloat(ma350mu2);
      
      // Calculate how far MA110 is from MA350MU2 as a percentage
      // Negative means MA110 is below MA350MU2 (not at top)
      // Positive means MA110 is above MA350MU2 (crossed above - potential top signal)
      // When it's close to 0%, we're approaching a potential top
      distanceToTopPct = (((ma110Value - ma350mu2Value) / ma350mu2Value) * 100).toFixed(2);
    }
    
    // Add to CSV
    csvContent += `${dateStr},${ma110},${ma350mu2},${distanceToTopPct}\n`;
  });
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
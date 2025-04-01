const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'fng-data.json');
const csvFilePath = path.join(__dirname, 'fng-data-readable.csv');

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
  
  console.log("Data structure:", Object.keys(data[0]));
  
  // Create CSV content with header
  let csvContent = 'Date,fng Index\n';
  
  // Extract values
  if (Array.isArray(data) && data.length > 0) {
    // Check if data is structured with "dates" and "values" arrays
    if (data[0].dates && Array.isArray(data[0].dates)) {
      console.log("Found dates array with", data[0].dates.length, "entries");
      
      // Look for the values array - it could have different names
      const valueKeys = ['values', 'value', 'fngIndex', 'escapeIndex', 'index', 'fngValues'];
      let valuesArray = null;
      let valuesKey = '';
      
      for (const key of valueKeys) {
        if (data[0][key] && Array.isArray(data[0][key])) {
          valuesArray = data[0][key];
          valuesKey = key;
          console.log(`Found values array with name "${key}" containing ${valuesArray.length} entries`);
          break;
        }
      }
      
      if (valuesArray) {
        // Dates and values are in parallel arrays
        for (let i = 0; i < data[0].dates.length; i++) {
          if (i < valuesArray.length) {
            const date = new Date(data[0].dates[i]);
            const dateStr = date.toISOString().split('T')[0];
            const fngValue = valuesArray[i];
            
            csvContent += `${dateStr},${fngValue}\n`;
          }
        }
        console.log(`Processed ${data[0].dates.length} data points from parallel arrays`);
      } else {
        console.log("Could not find values array, checking for other structures...");
      }
    } else if (data[0].timestamp || data[0].date) {
      // Structure is an array of objects with individual timestamp/value pairs
      console.log("Processing data as array of individual objects");
      
      data.forEach((item, i) => {
        if (i === 0) {
          console.log("First item structure:", JSON.stringify(item));
        }
        
        const timestamp = item.timestamp || item.date;
        if (!timestamp) {
          console.warn(`Item ${i} missing timestamp, skipping`);
          return;
        }
        
        // Convert timestamp to date
        const date = new Date(timestamp);
        const dateStr = date.toISOString().split('T')[0];
        
        // Look for the index value using different possible property names
        let fngIndex = 'Unknown';
        const valueKeys = ['value', 'fngIndex', 'escapeIndex', 'index', 'fng'];
        
        for (const key of valueKeys) {
          if (item[key] !== undefined) {
            fngIndex = item[key];
            if (i === 0) console.log(`Found value in property "${key}"`);
            break;
          }
        }
        
        // Add to CSV
        csvContent += `${dateStr},${fngIndex}\n`;
      });
      
      console.log(`Processed ${data.length} individual data points`);
    } else {
      console.error("Unrecognized data structure");
    }
  } else {
    console.error("Data is not an array or is empty");
  }
  
  // Write the CSV file
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`CSV file created successfully: ${csvFilePath}`);
  
} catch (error) {
  console.error("Error in script:", error);
} 
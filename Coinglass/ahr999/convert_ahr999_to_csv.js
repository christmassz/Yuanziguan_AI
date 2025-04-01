// convert_ahr999_to_csv.js
const fs = require('fs');
const path = require('path');

// Read the JSON data
const filePath = path.join(__dirname, 'ahr999-data.json');
let rawData;
try {
    rawData = fs.readFileSync(filePath, 'utf8');
    console.log("Raw data type:", typeof rawData);
    console.log("Data preview:", rawData.substring(0, 100));
} catch (error) {
    console.error('Error reading file:', error.message);
    process.exit(1);
}

// Parse the JSON data
let data;
try {
    data = JSON.parse(rawData);
    console.log("Data structure:", JSON.stringify(data).substring(0, 200));
} catch (error) {
    console.error('Error parsing JSON:', error.message);
    process.exit(1);
}

// Format based on the actual structure (which we don't know yet)
let formattedData = [];

// Flexible data structure handling
if (Array.isArray(data)) {
    formattedData = data; // Already an array
} else if (data && typeof data === 'object') {
    // Try to find an array in the object
    if (data.data && Array.isArray(data.data)) {
        formattedData = data.data;
    } else if (data.list && Array.isArray(data.list)) {
        formattedData = data.list;
    } else {
        // Try to convert object to array if it has numeric keys
        const possibleArray = Object.keys(data)
            .filter(key => !isNaN(parseInt(key)))
            .map(key => data[key]);
        
        if (possibleArray.length > 0) {
            formattedData = possibleArray;
        }
    }
}

if (formattedData.length === 0) {
    console.error('Expected JSON data to be an array or contain an array');
    console.log('Actual data format:', typeof data, Object.keys(data));
    process.exit(1);
}

// Create CSV with just date and ahr999 index
const csvLines = [
    "Date,AHR999 Index" // Simplified header with only date and AHR999
];

// Map the data to the desired format
formattedData.forEach(item => {
    // Extract only date and ahr999 values with fallbacks for different possible field names
    const date = item.date || item.time || (item.timestamp ? new Date(item.timestamp).toISOString().split('T')[0] : 'Unknown');
    const ahr999 = item.ahr999 || item.ahr999Index || item.ahr_index || 'Unknown';
    
    csvLines.push(`${date},${ahr999}`);
});

// Write to file
try {
    fs.writeFileSync(path.join(__dirname, 'ahr999-data-readable.csv'), csvLines.join('\n'));
    console.log('CSV file created successfully');
} catch (error) {
    console.error('Error writing CSV:', error.message);
    process.exit(1);
}
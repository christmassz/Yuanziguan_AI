const fs = require('fs');
const path = require('path');

// File paths
const jsonFilePath = path.join(__dirname, 'lth-data.json');
const csvFilePath = path.join(__dirname, 'lth-data-readable.csv');

try {
    // Read and parse the JSON file
    const rawData = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(rawData);
    console.log(`Found ${data.length} data points`);
    
    // First, find the average log scaling factor between price and supply across the dataset
    // This will serve as our "standard" relationship
    let totalLogRatio = 0;
    let validDataPoints = 0;
    
    data.forEach(item => {
        if (!item.timestamp || !item.price || !item.supply) return;
        
        const supplyInBTC = item.supply / 1000000;
        const logPrice = Math.log10(item.price);
        const logSupply = Math.log10(supplyInBTC);
        
        totalLogRatio += (logSupply - logPrice);
        validDataPoints++;
    });
    
    // Calculate average ratio to use as baseline
    const averageLogRatio = totalLogRatio / validDataPoints;
    console.log(`Baseline log ratio: ${averageLogRatio.toFixed(4)}`);
    
    // Create CSV content with header
    let csvContent = 'Date,Price,LTH Supply,Log Price,Log Supply,Normalized Ratio\n';
    
    // Arrays for tracking min/max values
    let minRatio = Infinity;
    let maxRatio = -Infinity;
    let ratios = [];
    
    // Process each item
    data.forEach((item, i) => {
        if (!item.timestamp || !item.price || !item.supply) {
            console.warn(`Item ${i} missing required data, skipping`);
            return;
        }
        
        // Convert timestamp to date
        const date = new Date(item.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        
        // Convert supply to same unit as price (BTC)
        const supplyInBTC = item.supply / 1000000; // Convert from satoshis to BTC
        
        // Calculate logs of both values
        const logPrice = Math.log10(item.price);
        const logSupply = Math.log10(supplyInBTC);
        
        // Calculate normalized ratio
        // Positive: supply is higher than expected relative to price
        // Negative: price is higher than expected relative to supply
        const normalizedRatio = (logSupply - logPrice) - averageLogRatio;
        
        ratios.push(normalizedRatio);
        minRatio = Math.min(minRatio, normalizedRatio);
        maxRatio = Math.max(maxRatio, normalizedRatio);
        
        // Add to CSV content
        csvContent += `${dateStr},${item.price},${item.supply},${logPrice},${logSupply},${normalizedRatio}\n`;
    });
    
    // Calculate average of normalized ratios (should be close to zero)
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    
    console.log(`Normalized Ratio Statistics:`);
    console.log(`Min: ${minRatio.toFixed(4)} (price highest above standard relationship)`);
    console.log(`Max: ${maxRatio.toFixed(4)} (supply highest above standard relationship)`);
    console.log(`Average: ${avgRatio.toFixed(4)} (should be close to zero)`);
    
    // Write the CSV file
    fs.writeFileSync(csvFilePath, csvContent);
    console.log(`CSV file created successfully: ${csvFilePath}`);
    
} catch (error) {
    console.error("Error in script:", error);
} 
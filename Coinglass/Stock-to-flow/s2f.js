//.js - Updated version
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const config = {
  dataDir: __dirname,
  mainCsvFile: path.join(__dirname, 's2f-ratio-data.csv'),
  mainJsonFile: path.join(__dirname, 's2f-ratio-data.json'),
  rawDataFile: path.join(__dirname, 's2f-data.json'),
  logFile: path.join(__dirname, 'scraper.log'),
  maxLogSize: 1024 * 1024  // 1MB max log size
};

// Logger function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Append to log file
  fs.appendFileSync(config.logFile, logMessage + '\n');
  
  // Rotate log if needed
  try {
    const stats = fs.statSync(config.logFile);
    if (stats.size > config.maxLogSize) {
      const oldLogPath = `${config.logFile}.old`;
      if (fs.existsSync(oldLogPath)) {
        fs.unlinkSync(oldLogPath);
      }
      fs.renameSync(config.logFile, oldLogPath);
      fs.writeFileSync(config.logFile, `[${timestamp}] Log rotated\n`);
    }
  } catch (e) {
    // Ignore errors with log rotation
  }
}

// Run a script and capture output
async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    log(`Running script: ${scriptPath}`);
    
    const child = spawn('node', [scriptPath]);
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`Script completed successfully: ${scriptPath}`);
        resolve(stdout);
      } else {
        log(`Script failed with code ${code}: ${scriptPath}`);
        log(`Error output: ${stderr}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

// Update the main data file with new entries
function updateMainDataFile() {
  try {
    // Make sure we have the raw data
    if (!fs.existsSync(config.rawDataFile)) {
      log('Raw data file not found');
      return false;
    }
    
    // Read the new data
    const newData = JSON.parse(fs.readFileSync(config.rawDataFile, 'utf8'));
    log(`Read ${newData.length} entries from raw data`);
    
    // Read existing data if it exists
    let existingData = [];
    if (fs.existsSync(config.mainJsonFile)) {
      existingData = JSON.parse(fs.readFileSync(config.mainJsonFile, 'utf8'));
      log(`Read ${existingData.length} entries from existing JSON file`);
    }
    
    // Find the newest date in the existing data
    let newestExistingDate = '1970-01-01';
    if (existingData.length > 0) {
      newestExistingDate = existingData.reduce((newest, item) => {
        return item.date > newest ? item.date : newest;
      }, newestExistingDate);
    }
    log(`Newest existing date: ${newestExistingDate}`);
    
    // Filter out entries from new data that are already in existing data
    const newEntries = newData.filter(item => item.date > newestExistingDate);
    log(`Found ${newEntries.length} new entries to add`);
    
    if (newEntries.length === 0) {
      log('No new entries to add, data is already up to date');
      return true;
    }
    
    // Merge and sort data
    const mergedData = [...existingData, ...newEntries].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    // Save updated JSON
    fs.writeFileSync(config.mainJsonFile, JSON.stringify(mergedData, null, 2));
    log(`Updated main JSON file with ${mergedData.length} total entries`);
    
    // Update the CSV file
    if (!fs.existsSync(config.mainCsvFile)) {
      // Create new CSV with headers
      const headers = 'date,price,s2fRatio\n';
      fs.writeFileSync(config.mainCsvFile, headers);
      log('Created new CSV file with headers');
    }
    
    // Append only new entries to CSV
    const csvLines = newEntries.map(item => 
      `${item.date},${item.price.toFixed(2)},${item.s2fRatio.toFixed(4)}`
    ).join('\n');
    
    fs.appendFileSync(config.mainCsvFile, csvLines + '\n');
    log(`Appended ${newEntries.length} new entries to the CSV file`);
    
    return true;
  } catch (error) {
    log(`Error updating main data file: ${error.message}`);
    return false;
  }
}

// Delete unnecessary files to keep folder clean
function cleanupFiles() {
  try {
    // Files to delete
    const filesToDelete = [
      'coinglass-page.png',  // Screenshot from auto-decrypt
      's2f-ratio.json', // Temporary JSON from previous steps
      'corrected-s2f-ratio.json', // Intermediate JSON 
      'corrected-s2f-ratio.csv',  // Intermediate CSV
      // Keep the raw data file as it's our source file
    ];
    
    // Delete files if they exist
    filesToDelete.forEach(file => {
      const filePath = path.join(config.dataDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log(`Deleted temporary file: ${file}`);
      }
    });
    
    return true;
  } catch (error) {
    log(`Error cleaning up files: ${error.message}`);
    return false;
  }
}

// Main function
async function main() {
  try {
    log('Starting s2f Ratio scraper');
    
    // Step 1: Run auto-decrypt.js to get the encrypted data and save it
    await runScript(path.join(config.dataDir, 'auto-decrypt.js'));
    
    // Step 2: Update the main data file with new entries
    updateMainDataFile();
    
    // Step 3: Run the CSV conversion script
    await runScript(path.join(config.dataDir, 'convert_s2f_to_csv.js'));
    log('Converted s2f data to readable CSV format');
    
    // Step 4: Clean up temporary files
    cleanupFiles();
    
    log('s2f Ratio scraper completed successfully');
  } catch (error) {
    log(`Error in s2f Ratio scraper: ${error.message}`);
  } 
}

// Run the script
main();
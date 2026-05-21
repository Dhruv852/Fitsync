/**
 * JSON File Storage Utility
 * Persists data to the filesystem using async read/write operations.
 * No database — all data lives in JSON files under the data/ directory.
 */
const fs = require('fs').promises;
const path = require('path');

// Resolve data directory from environment or default to ./data
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

/**
 * Ensure the data directory exists before any read/write
 */
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

/**
 * Read and parse a JSON file; returns defaultValue if file missing or empty
 * @param {string} filename - e.g. 'users.json'
 * @param {*} defaultValue - fallback when file doesn't exist
 */
async function readJson(filename, defaultValue = []) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeJson(filename, defaultValue);
      return defaultValue;
    }
    throw err;
  }
}

/**
 * Write data to a JSON file with pretty formatting for readability
 */
async function writeJson(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJson, writeJson, DATA_DIR };

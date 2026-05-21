const fs = require('fs').promises;
const path = require('path');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

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

async function writeJson(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJson, writeJson };

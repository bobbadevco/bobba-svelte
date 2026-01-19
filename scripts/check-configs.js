import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
    'renderer-config.json',
    'ui-config.json'
];

const staticDir = path.resolve(__dirname, '../static');
const missingFiles = [];

requiredFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
    }
});

if (missingFiles.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing configuration files:');
    missingFiles.forEach(file => {
        console.error(`   - ${file}`);
    });
    console.error('\x1b[33m%s\x1b[0m', 'Please create these files by copying the .example files in the static directory.');
    process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', 'Configuration files found.');

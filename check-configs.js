import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for required configuration files

const requiredFiles = [
    'renderer-config.json',
    'ui-config.json'
];

const staticDir = path.resolve(__dirname, './static');
const missingFiles = [];

requiredFiles.forEach(file => {
    const filePath = path.join(staticDir, file);
    if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
    }
});

// Check for theme MainView
let userTheme = 'default';
try {
    const uiConfigPath = path.join(staticDir, 'ui-config.json');
    if (fs.existsSync(uiConfigPath)) {
        const uiConfig = JSON.parse(fs.readFileSync(uiConfigPath, 'utf-8'));
        userTheme = uiConfig.theme || 'default';
    }
} catch (_e) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: Could not find theme from ui-config.json, using default theme.');
}

const userThemeDir = path.resolve(__dirname, `./src/lib/themes/${userTheme}`);
const mainViewPath = path.join(userThemeDir, 'MainView.svelte');
const themeMainViewMissing = !fs.existsSync(mainViewPath);

if (missingFiles.length > 0 || themeMainViewMissing) {
    if (missingFiles.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: Missing configuration files:');
        missingFiles.forEach(file => {
            console.error(`   - ${file}`);
        });
        console.error('\x1b[33m%s\x1b[0m', 'Please create these files by copying the .example files in the static directory.');
    }
    
    if (themeMainViewMissing) {
        console.error('\x1b[31m%s\x1b[0m', `Error: Theme ${userTheme} MainView does not exist:`);
        console.error(`   - ${mainViewPath}`);
        console.error('\x1b[33m%s\x1b[0m', `Please create the MainView.svelte file or set the theme in ui-config.json to a valid theme directory.`);
    }
    
    process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', 'Configuration files and theme MainView found.');

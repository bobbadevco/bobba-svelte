import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const THEMES_DIR = path.join(ROOT, 'src', 'lib', 'themes')
const FLASH_LOADING_VIEW_SVELTE = `<script>
	import { getIsError, getIsReady, getMessage, getPercent } from '$lib/initialize.svelte';
</script>

<div class="text-white">
	{getPercent()}
	{getMessage()}
	{getIsError()}
	{getIsReady()}
</div>
`

const FLASH_MAIN_VIEW_SVELTE = `<script lang="ts">
    
</script>
`

function validateThemeName(name: string) {
	if (!name) return 'Theme name is required'
	if (!/^[a-z0-9-]+$/.test(name)) return 'Theme name must be lowercase alphanumeric with hyphens only'
	if (name.startsWith('-') || name.endsWith('-')) return 'Theme name cannot start or end with a hyphen'
	return null
}

function main() {
	const args = process.argv.slice(2)

	if (args.length < 2 || args[0] !== 'add') {
		console.error('Usage: npm run theme add <theme-name>')
		process.exit(1)
	}

	const themeName = args[1]
	const error = validateThemeName(themeName)
	if (error) {
		console.error(`Error: ${error}`)
		process.exit(1)
	}

	if (!fs.existsSync(THEMES_DIR)) {
		console.error('Error: themes directory not found')
		process.exit(1)
	}

	const themeDir = path.join(THEMES_DIR, themeName)
	if (fs.existsSync(themeDir)) {
		console.error(`Error: Theme "${themeName}" already exists`)
		process.exit(1)
	}

	const themesScssPath = path.join(THEMES_DIR, 'themes.scss')
	if (!fs.existsSync(themesScssPath)) {
		console.error('Error: themes.scss not found')
		process.exit(1)
	}

	fs.mkdirSync(path.join(themeDir, 'assets'), { recursive: true })
	fs.mkdirSync(path.join(themeDir, 'generic'), { recursive: true })
	fs.mkdirSync(path.join(themeDir, 'views'), { recursive: true })

	fs.writeFileSync(path.join(themeDir, 'LoadingView.svelte'), FLASH_LOADING_VIEW_SVELTE, 'utf-8')
	fs.writeFileSync(path.join(themeDir, 'MainView.svelte'), FLASH_MAIN_VIEW_SVELTE, 'utf-8')
	fs.writeFileSync(path.join(themeDir, 'theme.scss'), '', 'utf-8')

	fs.appendFileSync(themesScssPath, `\n@import './${themeName}/theme.scss';\n`, 'utf-8')

	console.log(`✓ Theme "${themeName}" created successfully`)
	console.log(`  ${themeDir}`)
	console.log()
	console.log('To use it, set "theme" in static/ui-config.json:')
	console.log(`  "theme": "${themeName}"`)
}

main()

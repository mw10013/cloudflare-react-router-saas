import * as jsonc from 'jsonc-parser'
import { $, fs, glob } from 'zx'
import 'zx/globals'

/* Script to reset the D1 database either locally or in an environment on Cloudflare.
- Delete existing database
- Create new database
- Update wrangler.jsonc files with new database id as necessary
- Runs migrations and seed

Command line args:
--env local|staging|production
*/

// const wranglerJsoncPaths = ['wrangler.jsonc', '../worker/wrangler.jsonc']
const wranglerJsoncPaths = ['wrangler.jsonc']

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env = argv.env ?? 'local'
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
const wranglerJsonc = await fs.readFile(wranglerJsoncPaths[0], 'utf-8')
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const wranglerJsoncTree = jsonc.parseTree(wranglerJsonc)
if (!wranglerJsoncTree) {
	throw new Error(`Failed to parse jsonc: ${wranglerJsoncPaths[0]}`)
}
const nodeDatabaseName = jsonc.findNodeAtLocation(
	wranglerJsoncTree,
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	env === 'local' ? ['d1_databases', 0, 'database_name'] : ['env', env, 'd1_databases', 0, 'database_name']
)
const databaseName = nodeDatabaseName?.value && typeof nodeDatabaseName.value === 'string' ? nodeDatabaseName.value : undefined
if (!databaseName) {
	throw new Error(`Failed to find database name in wrangler.jsonc: ${wranglerJsoncPaths[0]} for env: ${String(env)}`)
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
console.log({ env, databaseName })

if (env === 'local') {
	// Reset the local d1 database violently, run any migrations, and seed.
	await $`rm -rf ./.wrangler`
	// await $`pnpm wrangler d1 execute d1-local --local --command "select datetime('now');"`;
	// https://github.com/cloudflare/workers-sdk/issues/5092
	await $`pnpm wrangler d1 execute ${databaseName} --local --command "pragma foreign_keys = ON;"`

	const migrationFiles = await glob('./migrations/*.sql')
	console.log({ migrationFiles })
	if (migrationFiles.length > 0) {
		await $`wrangler d1 migrations apply ${databaseName} --local`
		// await $`pnpm d1:seed`
	}
	const sqliteFiles = await glob('./.wrangler/state/v3/d1/**/*.sqlite')
	console.log({ sqliteFiles })
	if (sqliteFiles.length !== 1) {
		console.error('Expected exactly one sqlite file under .wrangler')
		process.exit(1)
	}
	const statements = `
.schema
pragma table_list`
	await $`echo ${statements} | sqlite3 ${sqliteFiles[0]}`

	console.log(`sqlite3 ${sqliteFiles[0]}`)
	process.exit(0)
}

// Attempt to delete existing database, ignore if it doesn't exist.
try {
	await $`pnpm wrangler d1 delete ${databaseName} --skip-confirmation`
} catch (p) {
	console.error(`Ignoring execption: ${String(p)}`)
}

// Create database and extract database id from output.
const processOutput = await $`pnpm wrangler d1 create ${databaseName}`
const databaseIdRegex = /"database_id":\s*"([a-f0-9-]+)"/
const match = processOutput.stdout.match(databaseIdRegex)
if (!match) throw new Error(`database_id not matched in output of create database command: ${processOutput.stdout}`)
const databaseId = match[1]
console.log({ databaseId })

for (const wranglerJsoncPath of wranglerJsoncPaths) {
	console.log({ wranglerJsoncPath })
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
	const wranglerJsonc = await fs.readFile(wranglerJsoncPath, 'utf-8')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const wranglerJsoncTree = jsonc.parseTree(wranglerJsonc)
	if (!wranglerJsoncTree) {
		throw new Error(`Failed to parse jsonc: ${wranglerJsoncPath}`)
	}
	const nodePath = ['env', env, 'd1_databases', 0, 'database_id']
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const nodeDatabaseId = jsonc.findNodeAtLocation(wranglerJsoncTree, nodePath)
	if (!nodeDatabaseId) {
		throw new Error(`Failed to find database_id in jsonc: ${wranglerJsoncPath}`)
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const edit = jsonc.modify(wranglerJsonc, nodePath, databaseId, {})
	if (!Array.isArray(edit) || edit.length === 0) {
		throw new Error(`Failed to modify jsonc: ${wranglerJsoncPath}`)
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
	await fs.writeFile(wranglerJsoncPath, jsonc.applyEdits(wranglerJsonc, edit))
}

// Run migrations.
await $`pnpm d1:migrate:apply:${env === 'production' ? 'PRODUCTION' : env}`

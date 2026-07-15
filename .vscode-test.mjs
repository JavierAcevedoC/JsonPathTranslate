import { defineConfig } from '@vscode/test-cli';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
	label: 'untrustedWorkspaceTests',
	files: 'out/test/**/*.test.js',
	workspaceFolder: './src/test/',
	// Keep Workspace Trust enabled and isolate user data for deterministic runs
	launchArgs: [
		'--user-data-dir',
		path.join(__dirname, '.vscode-test', 'user-data-untrusted')
	]
}
]);

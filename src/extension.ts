// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const decoder = new TextDecoder("utf8");

export async function getFilesWithRegex(regexPattern: RegExp): Promise<vscode.Uri[]> {
	// 1. Fetch a broad list of files using a generic glob pattern
	const allFiles = await vscode.workspace.findFiles('**/*', '**/node_modules/**');

	// 2. Filter the array using JavaScript's native .filter() and your RegExp
	const matchedFiles = allFiles.filter(uri => {
		// You can test uri.path or uri.fsPath depending on OS-specific separator needs
		return regexPattern.test(uri.fsPath);
	});

	return matchedFiles;
}

export async function getJsonFromFile(filePath: string) {
	try {
		const fileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
		const jsonContent = JSON.parse(decoder.decode(fileContent));
		return jsonContent;
	} catch (error) {
		console.error(`Error reading or parsing JSON file at ${filePath}:`, error);
		throw error;
	}
}

export async function translationPath(path: string, word: string): Promise<string | string[]> {
	const data = await getJsonFromFile(path);

	function findPath(obj: any, value: string, currentPath = "", paths: string[] = []) {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const newPath = currentPath ? `${currentPath}.${key}` : key;
				if (typeof obj[key] === "object" && obj[key] !== null) {
					findPath(obj[key], value, newPath, paths);
				} else if (obj[key] === value) {
					paths.push(newPath);
				}
			}
		}
		return paths.length > 1 ? paths : paths[0];
	}

	return findPath(data, word);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('jsonpathtranslate.searchtranslate', async () => {
		// The code you place here will be executed every time your command is executed
		const myRegex = /.*\.json$/i;
		const data = await getFilesWithRegex(myRegex)
		// list all the files found in the command palette list to select one
		const selectedFile = await vscode.window.showQuickPick(data.map(uri => uri.fsPath), { placeHolder: 'Select a JSON file' });
		if (selectedFile === undefined) {
			vscode.window.showInformationMessage('No file selected. Please try again.');
			return;
		}
		let inputWord = await vscode.window.showInputBox({ prompt: 'Enter the word to search for' });
		if (inputWord === undefined || inputWord.trim() === '') {
			while (inputWord === undefined || inputWord.trim() === '') {
				vscode.window.showInformationMessage('No word entered. Please try again.');
				inputWord = await vscode.window.showInputBox({ prompt: 'Enter the word to search for' });
			}
		}
		const found = await translationPath(selectedFile, inputWord);
		if (Array.isArray(found)) {
			found.forEach(path => {
				vscode.window.showInformationMessage(path);
			});
		} else {
			vscode.window.showInformationMessage(found);
			vscode.env.clipboard.writeText(found);
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }

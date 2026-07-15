import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension is activated', () => {
		assert.ok(myExtension);
	});

	test('getJsonFromFile returns valid JSON object', async () => {
		const testFilePath = vscode.Uri.file(vscode.workspace.workspaceFolders![0].uri.fsPath + '/test.json').fsPath;
		const jsonData = await myExtension.getJsonFromFile(testFilePath);
		assert.ok(jsonData, 'Expected a valid JSON object');
		assert.strictEqual(jsonData.schema.hello, 'test', 'Expected the "hello" property to be "test"');
	});

	test('getFilesWithRegex returns an array of URIs', async () => {
		const regexPattern = /.*\.json$/i;
		const files = await myExtension.getFilesWithRegex(regexPattern);
		assert.ok(Array.isArray(files), 'Expected an array of URIs'); // just test.json
		assert.ok(files.every(uri => uri instanceof vscode.Uri), 'Expected all elements to be instances of vscode.Uri');
	});

	test('JSONPath translation test', async () => {
		const regexPattern = /.*\.json$/i;
		const files = await myExtension.getFilesWithRegex(regexPattern);
		const input = files[0];
		const expectedOutput = 'schema.hello';
		const actualOutput = await myExtension.translationPath(input.path, 'test');
		assert.strictEqual(actualOutput, expectedOutput);
	});
});


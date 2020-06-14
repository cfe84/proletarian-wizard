import * as vscode from 'vscode'
import * as fs from "fs"
import * as path from "path"
import { SaveFileCommand } from './commands/SaveFileCommand'
import { ConsoleLogger } from './ConsoleLogger'
import { StdDate } from './StdDate'

export function activate(context: vscode.ExtensionContext) {

	const logger = new ConsoleLogger()
	const date = new StdDate()
	const deps = {
		logger,
		date,
		fs,
		path
	}
	logger.log("Loaded")

	const saveFileCommand = new SaveFileCommand(deps)
	let disposable = vscode.commands.registerCommand("pw.saveFile", saveFileCommand.executeAsync);
	context.subscriptions.push(disposable);
}

export function deactivate() { }

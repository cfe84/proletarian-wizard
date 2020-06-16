import * as vscode from 'vscode'
import * as fs from "fs"
import * as path from "path"
import { SaveFileCommand } from './commands/SaveFileCommand'
import { ConsoleLogger } from './ConsoleLogger'
import { StdDate } from './StdDate'
import { VSUiSelector } from './selectors/VSUiSelector'
import { IDependencies } from '../contract/IDependencies'
import { IContext } from '../contract/IContext'
import { OpenFileCommand } from './commands/OpenFileCommand'
import { ICommand } from './commands/ICommand'
import { ArchiveProjectCommand } from './commands/ArchiveProjectCommand'
import { CreateProjectCommand } from './commands/CreateProjectCommand'
import { CreateNoteFromTemplate } from './commands/CreateNoteFromTemplate'

export function activate(vscontext: vscode.ExtensionContext) {
	const logger = new ConsoleLogger()
	const date = new StdDate()
	const uiSelector = new VSUiSelector()
	const deps: IDependencies = {
		logger,
		date,
		fs,
		path,
		uiSelector,
	}
	if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length > 1) {
		logger.error(`No folder is open, or more than one folder is open`)
		return null
	}
	const rootFolder = vscode.workspace.workspaceFolders[0].uri.path
	const context: IContext = {
		rootFolder
	}
	logger.log("Loaded")

	const commands: ICommand<string | null>[] = [
		new SaveFileCommand(deps, context),
		new OpenFileCommand(deps, context),
		new ArchiveProjectCommand(deps, context),
		new CreateProjectCommand(deps, context),
		new CreateNoteFromTemplate(deps, context)
	]
	commands.forEach(command => {
		let disposable = vscode.commands.registerCommand(command.Id, command.executeAsync);
		vscontext.subscriptions.push(disposable);
	})
}

export function deactivate() { }

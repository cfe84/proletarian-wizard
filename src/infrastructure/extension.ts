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
import { ConfigFileLoader } from '../domain/ConfigFileLoader'
import { CreateRecurrenceCommand } from './commands/CreateRecurrenceCommand'
import { CreateReferenceFolderCommand } from './commands/CreateReferenceFolderCommand'
import { AddDateToLineCommand } from './commands/AddDateToLineCommand'
import { ToggleTodoCommand } from './commands/ToggleTodoCommand'
import { MarkTodoAsCancelledCommand } from './commands/MarkTodoAsCancelledCommand'
import { MarkTodoAsCompleteCommand } from './commands/MarkTodoAsCompleteCommand'
import { MarkTodoAsDelegatedCommand } from './commands/MarkTodoAsDelegatedCommand'
import { MarkTodoAsAttentionRequiredCommand } from './commands/MarkTodoAsAttentionRequiredCommand'
import { MarkTodoAsInProgressCommand } from './commands/MarkTodoAsInProgressCommand'
import { MarkTodoAsTodoCommand } from './commands/MarkTodoAsTodoCommand'
import { TodoItemFsEventListener } from './eventListeners.ts/TodoItemFsEventListener'
import { FolderTodoParser } from '../domain/FolderTodoParser'
import { TodoHierarchicView } from './views/TodoHierarchicView'

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
	const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath
	const configFile = deps.path.join(rootFolder, ".pw", "config.yml")
	const configLoader = new ConfigFileLoader(deps)
	const config = configLoader.loadConfig(configFile)

	const context: IContext = {
		rootFolder,
		config: config || undefined,
		todos: []
	}
	logger.log("Loaded")

	const commands: ICommand<string | null>[] = [
		new SaveFileCommand(deps, context),
		new OpenFileCommand(deps, context),
		new ArchiveProjectCommand(deps, context),
		new CreateProjectCommand(deps, context),
		new CreateRecurrenceCommand(deps, context),
		new CreateReferenceFolderCommand(deps, context),
		new CreateNoteFromTemplate(deps, context),
		new AddDateToLineCommand(deps, context),
		new ToggleTodoCommand(deps, context),
		new MarkTodoAsCancelledCommand(deps, context),
		new MarkTodoAsCompleteCommand(deps, context),
		new MarkTodoAsDelegatedCommand(deps, context),
		new MarkTodoAsAttentionRequiredCommand(deps, context),
		new MarkTodoAsInProgressCommand(deps, context),
		new MarkTodoAsTodoCommand(deps, context),
	]
	commands.forEach(command => {
		let disposable = vscode.commands.registerCommand(command.Id, command.executeAsync);
		vscontext.subscriptions.push(disposable);
	})

	const folderParser = new FolderTodoParser(deps, context)
	const todoItemFsEventListener = new TodoItemFsEventListener(deps, context, folderParser)

	vscontext.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((event) => todoItemFsEventListener.onFileSaved(event)),
		vscode.workspace.onDidRenameFiles((event) => todoItemFsEventListener.onFileRenamed(event)),
		vscode.workspace.onDidCreateFiles(event => todoItemFsEventListener.onFileCreated(event)),
		vscode.workspace.onDidDeleteFiles(event => todoItemFsEventListener.onFileDeleted(event))
	)
	context.todos = folderParser.parseFolder(context.rootFolder)

	const todosView = new TodoHierarchicView(deps, context)
	todoItemFsEventListener.fileDidChange.push(() => todosView.refresh())
	vscode.window.registerTreeDataProvider("pw.todoHierarchy", todosView)
}

export function deactivate() { }

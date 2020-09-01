import * as vscode from 'vscode';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { threadId } from 'worker_threads';
import { FolderTodoParser } from '../../domain/FolderTodoParser';

export class TodoItemFsEventListener {
  constructor(private deps: IDependencies, private ctx: IContext, private parser: FolderTodoParser) {

  }

  private refreshTodos() {
    this.ctx.todos = this.parser.parseFolder(this.ctx.rootFolder)
  }

  onFileCreated(change: vscode.FileCreateEvent) {
    this.refreshTodos()
  }

  onFileChanged(change: vscode.TextDocumentChangeEvent) {
    if (change.document.fileName.endsWith(".md"))
      this.refreshTodos()

  }

  onFileRenamed(change: vscode.FileRenameEvent) {
    this.refreshTodos()

  }

  onFileDeleted(change: vscode.FileDeleteEvent) {
    this.refreshTodos()
  }
}
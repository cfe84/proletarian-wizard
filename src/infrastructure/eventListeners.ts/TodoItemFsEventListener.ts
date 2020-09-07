import * as vscode from 'vscode';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { threadId } from 'worker_threads';
import { FolderTodoParser } from '../../domain/FolderTodoParser';
import { Document } from 'yaml';

export class TodoItemFsEventListener {
  private lastUpdate = 0
  constructor(private deps: IDependencies, private ctx: IContext, private parser: FolderTodoParser) {
  }

  private refreshTodos() {
    if (Date.now() > this.lastUpdate + 100) {
      this.lastUpdate = Date.now()
      this.ctx.parsedFolder = this.parser.parseFolder(this.ctx.rootFolder)
      this.fileDidChange.forEach(callback => callback())
    }
  }

  public fileDidChange: (() => void)[] = []

  onFileCreated(change: vscode.FileCreateEvent) {
    this.refreshTodos()
  }

  onFileSaved(document: vscode.TextDocument) {
    if (document.fileName.endsWith(".md"))
      this.refreshTodos()
  }

  onFileRenamed(change: vscode.FileRenameEvent) {
    this.refreshTodos()
  }

  onFileDeleted(change: vscode.FileDeleteEvent) {
    this.refreshTodos()
  }
}
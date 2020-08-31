import * as vscode from 'vscode';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { threadId } from 'worker_threads';

export class TodoItemFsEventListener {
  constructor(private deps: IDependencies, private ctx: IContext) {
  }

  onFileCreated(change: vscode.FileCreateEvent) {
    this.deps.logger.log(change.files.map(file => file.fsPath).join(" - "))
  }

  onFileChanged(change: vscode.TextDocumentChangeEvent) {
    if (change.document.fileName.endsWith(".md"))
      this.deps.logger.log(change.document.fileName)
  }

  onFileRenamed(change: vscode.FileRenameEvent) {
    this.deps.logger.log(change.files.map(file => file.newUri.fsPath).join(" - "))
  }
}
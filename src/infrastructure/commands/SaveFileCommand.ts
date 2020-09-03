import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../../domain/FolderSelector';
import { FileNameAssembler } from '../../domain/FileNameAssembler';
import { IContext } from '../../contract/IContext';
import { FileSaveSelector } from '../selectors/FileSaveSelector';

export class SaveFileCommand implements ICommand<string | null> {
  private fileNameAssembler: FileNameAssembler;
  private fileSaveSelector: FileSaveSelector;
  constructor(private deps: IDependencies, private context: IContext) {
    this.fileNameAssembler = new FileNameAssembler(deps)
    this.fileSaveSelector = new FileSaveSelector(deps, context)
  }
  get Id(): string { return "pw.saveFile" }

  executeAsync = async (): Promise<string | null> => {
    if (!vscode.window.activeTextEditor) {
      vscode.window.showErrorMessage("No editor is open")
      return null
    }
    if (!vscode.window.activeTextEditor.document.isUntitled) {
      const res = await vscode.window.showQuickPick(["File already saved, don't save", "Make a copy"], { canPickMany: false })
      if (res !== "Make a copy") {
        return null
      }
    }
    const path = await this.fileSaveSelector.selectFileDestinationAsync()
    if (!path) {
      return null
    }
    const editor = vscode.window.activeTextEditor
    const content = editor.document.getText()
    this.deps.fs.writeFileSync(path, content)
    await editor.edit((edit) => {
      edit.delete(new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(content.length)))
    })
    vscode.commands.executeCommand("workbench.action.closeActiveEditor", true, false)
    vscode.window.showTextDocument(vscode.Uri.file(path))
    return path
  }
}
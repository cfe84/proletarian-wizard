import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../../domain/FolderSelector';
import { FileNameAssembler } from '../../domain/FileNameAssembler';
import { IContext } from '../../contract/IContext';

export class SaveFileCommand implements ICommand<string | null> {
  private fileNameAssembler: FileNameAssembler;
  constructor(private deps: IDependencies, private context: IContext) {
    this.fileNameAssembler = new FileNameAssembler(deps)
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
    const typeSelector = new FolderSelector({ allowThisFolder: true }, this.deps, this.context);
    const folder = await typeSelector.selectFolderAsync()
    if (!folder) {
      return null;
    }
    let initialValue = this.deps.date.todayAsYMDString() + " - "
    if (folder.underSpecialFolder === "Recurrence") {
      initialValue += folder.name
    }
    let fileName = await vscode.window.showInputBox({ prompt: "File name", value: initialValue })
    if (!fileName) {
      return null
    }
    const path = this.fileNameAssembler.assembleFileName({ fileName, path: folder.path, fixDate: false })
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
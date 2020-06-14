import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../selectors/FolderSelector';

export class SaveFileCommand implements ICommand {
  constructor(private deps: IDependencies) { }
  get Id(): string { return "pw.saveFile" }

  private fixFilename(filename: string) {


    return filename
  }

  executeAsync = async () => {
    const typeSelector = new FolderSelector()
    const folder = await typeSelector.selectFolderAsync()
    if (!folder) {
      return;
    }
    let filename = await vscode.window.showInputBox({ prompt: "File name" })
    if (!filename) {
      return
    }
    filename = this.fixFilename(filename)
    vscode.window.showInformationMessage('Saving as ' + folder + filename);
  }
}
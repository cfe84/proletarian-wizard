import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../selectors/FolderSelector';
import { FileNameAssembler } from '../../domain/FileNameAssembler';

export class SaveFileCommand implements ICommand {
  private fileNameAssembler: FileNameAssembler;
  constructor(private deps: IDependencies) {
    this.fileNameAssembler = new FileNameAssembler(deps)
  }
  get Id(): string { return "pw.saveFile" }

  executeAsync = async () => {
    const typeSelector = new FolderSelector(this.deps)
    const folder = await typeSelector.selectFolderAsync()
    if (!folder) {
      return;
    }
    const initalValue = this.deps.date.todayAsYMDString() + " - "
    let fileName = await vscode.window.showInputBox({ prompt: "File name", value: initalValue })
    if (!fileName) {
      return
    }
    const path = this.fileNameAssembler.assembleFileName({ fileName, path: folder, fixDate: false })
    vscode.window.showInformationMessage('Saving as ' + path);
  }
}
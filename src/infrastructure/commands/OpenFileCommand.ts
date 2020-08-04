import * as vscode from 'vscode';
import { ICommand } from "./ICommand";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";
import { FolderSelector } from "../../domain/FolderSelector";
import { FileSelector } from "../../domain/FileSelector";
import { IFolder } from '../../contract/IFolder';

export class OpenFileCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  executeAsync = async (): Promise<string | null> => {
    const folderSelector = new FolderSelector({ allowThisFolder: true }, this.deps, this.context);
    const fileSelector = new FileSelector(this.deps);
    let folder: IFolder | null = null;
    let file: string | null = null;
    do {
      folder = await folderSelector.selectFolderAsync()
      if (!folder) {
        return null
      }
      file = await fileSelector.selectFileAsync(folder.path)
    } while (file === null)
    vscode.window.showTextDocument(vscode.Uri.file(file))
    return file
  }
  get Id(): string { return "pw.openFile" };

}
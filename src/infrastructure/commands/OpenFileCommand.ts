import * as vscode from 'vscode';
import { ICommand } from "./ICommand";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";
import { FolderSelector } from "../../domain/FolderSelector";
import { FileSelector } from "../../domain/FileSelector";

export class OpenFileCommand implements ICommand {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  executeAsync = async (): Promise<void> => {
    const folderSelector = new FolderSelector(this.deps, this.context.rootFolder);
    const fileSelector = new FileSelector(this.deps);
    let folder: string | null = null;
    let file: string | null = null;
    do {
      folder = await folderSelector.selectFolderAsync()
      if (!folder) {
        return
      }
      file = await fileSelector.selectFileAsync(folder)
    } while (file === null)
    vscode.window.showTextDocument(vscode.Uri.file(file))
  }
  get Id(): string { return "pw.openFile" };

}
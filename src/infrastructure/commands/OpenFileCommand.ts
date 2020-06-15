import { ICommand } from "./ICommand";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";
import { FolderSelector } from "../../domain/FolderSelector";

export class OpenFileCommand implements ICommand {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  async executeAsync(): Promise<void> {
    const folderSelector = new FolderSelector(this.deps, this.context.rootFolder);
    const folder = await folderSelector.selectFolderAsync()

  }
  get Id(): string { return "pw.openFile" };

}
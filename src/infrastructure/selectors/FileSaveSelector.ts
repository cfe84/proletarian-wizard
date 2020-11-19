import * as vscode from 'vscode';
import { FolderSelector } from "../../domain/FolderSelector";
import { FileNameAssembler } from "../../domain/FileNameAssembler";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";

export class FileSaveSelector {
  private fileNameAssembler: FileNameAssembler;
  constructor(private deps: IDependencies, private context: IContext) {
    this.fileNameAssembler = new FileNameAssembler(deps)
  }
  async selectFileDestinationAsync(): Promise<string | null> {
    const typeSelector = new FolderSelector({ allowThisFolder: true, allowCreateFolder: true }, this.deps, this.context);
    const folder = await typeSelector.selectFolderAsync()
    if (!folder) {
      return null;
    }
    let initialValue = this.deps.date.todayAsYMDString() + " - "
    if (folder.underSpecialFolder === "Recurrence") {
      initialValue += folder.name
    }
    if (folder.underSpecialFolder === "Project" && !folder.isSpecialFolder) {
      const projectName = folder.name.replace(/\d\d\d\d-\d\d-\d\d - /, "")
      initialValue += projectName + " - "
    }
    let fileName = await vscode.window.showInputBox({ prompt: "File name", value: initialValue })
    if (!fileName) {
      return null
    }
    const path = this.fileNameAssembler.assembleFileName({ fileName, path: folder.path, fixDate: false })
    return path
  }
}
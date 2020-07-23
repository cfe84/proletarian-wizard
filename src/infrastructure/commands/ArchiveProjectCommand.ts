import * as vscode from 'vscode';
import { ICommand } from "./ICommand";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";
import { FolderSelector } from "../../domain/FolderSelector";
import { FileSelector } from '../../domain/FileSelector';

export class ArchiveProjectCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  executeAsync = async (): Promise<string | null> => {
    const folderSelector = new FolderSelector({ allowThisFolder: true }, this.deps, this.context);
    let projectFolder = await folderSelector.selectFolderAsync("Project")
    if (!projectFolder) {
      return null
    }
    if (projectFolder === folderSelector.getSpecialFolder("Project")) {
      const fileSelector = new FileSelector(this.deps)
      projectFolder = await fileSelector.selectFileAsync(projectFolder)
    }
    if (!projectFolder) {
      return null
    }
    const archiveFolder = folderSelector.getSpecialFolder("Archive")
    const yearlyFolder = this.deps.path.join(archiveFolder, this.deps.date.thisYearAsYString())
    const projectFolderName = this.deps.path.basename(projectFolder)
    const destination = this.deps.path.join(yearlyFolder, projectFolderName)
    if (!this.deps.fs.existsSync(yearlyFolder)) {
      this.deps.fs.mkdirSync(yearlyFolder)
    }
    vscode.window.showInformationMessage(`Archived project ${projectFolderName}`)
    this.deps.fs.renameSync(projectFolder, destination)
    return projectFolderName
  }
  get Id(): string { return "pw.archiveProject" };

}
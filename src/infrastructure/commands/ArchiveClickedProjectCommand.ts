import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { FolderSelector } from '../../domain/FolderSelector';
import * as vscode from "vscode"

interface File {
  fsPath: string,
  external: string,
  path: string,
  scheme: string,
  _sep: number
}

export class ArchiveClickedProjectCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  get Id(): string { return "pw.archiveClickedProject" }

  executeAsync = async (file: File): Promise<string | null> => {
    this.deps.logger.log(`Open ${file.fsPath}`)
    const folderSelector = new FolderSelector({ allowThisFolder: true }, this.deps, this.context);
    const projectFolder = this.deps.path.resolve(folderSelector.getSpecialFolder("Project"))
    const parentFolder = this.deps.path.resolve(this.deps.path.dirname(file.fsPath))
    if (this.deps.path.resolve(parentFolder) !== this.deps.path.resolve(projectFolder)) {
      vscode.window.showErrorMessage(`Not a project (${parentFolder} vs ${projectFolder})`)
      return null
    }
    const archiveFolder = folderSelector.getSpecialFolder("Archive")
    const yearlyFolder = this.deps.path.join(archiveFolder, this.deps.date.thisYearAsYString())
    const projectFolderName = this.deps.path.basename(file.fsPath)

    const destination = this.deps.path.join(yearlyFolder, projectFolderName)
    if (!this.deps.fs.existsSync(yearlyFolder)) {
      this.deps.fs.mkdirSync(yearlyFolder)
    }
    vscode.window.showInformationMessage(`Archived project ${projectFolderName}`)
    this.deps.fs.renameSync(file.fsPath, destination)
    return projectFolderName
  }
}
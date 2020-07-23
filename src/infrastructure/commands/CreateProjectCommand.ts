import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../../domain/FolderSelector';
import { IContext } from '../../contract/IContext';

export class CreateProjectCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  get Id(): string { return "pw.createProject" }

  executeAsync = async (): Promise<string | null> => {
    const folderSelector = new FolderSelector({}, this.deps, this.context)
    const initalValue = this.deps.date.todayAsYMDString() + " - "
    let projectName = await vscode.window.showInputBox({ prompt: "Project name", value: initalValue })
    if (!projectName) {
      return null
    }
    const projectPath = this.deps.path.join(folderSelector.getSpecialFolder("Project"), projectName)
    this.deps.fs.mkdirSync(projectPath)
    return projectPath
  }
}
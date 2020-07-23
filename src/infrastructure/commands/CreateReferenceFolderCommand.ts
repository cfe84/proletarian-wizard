import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../../domain/FolderSelector';
import { IContext } from '../../contract/IContext';

export class CreateReferenceFolderCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  get Id(): string { return "pw.createReference" }

  executeAsync = async (): Promise<string | null> => {
    const folderSelector = new FolderSelector({}, this.deps, this.context)
    const initalValue = ""
    let referenceName = await vscode.window.showInputBox({ prompt: "Reference folder name", value: initalValue })
    if (!referenceName) {
      return null
    }
    const referencePath = this.deps.path.join(folderSelector.getSpecialFolder("Reference"), referenceName)
    this.deps.fs.mkdirSync(referencePath)
    return referencePath
  }
}
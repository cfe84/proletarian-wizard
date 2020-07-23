import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { FolderSelector } from '../../domain/FolderSelector';
import { IContext } from '../../contract/IContext';

export class CreateRecurrenceCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  get Id(): string { return "pw.createRecurrence" }

  executeAsync = async (): Promise<string | null> => {
    const folderSelector = new FolderSelector({}, this.deps, this.context)
    const initalValue = ""
    let recurrenceName = await vscode.window.showInputBox({ prompt: "Recurrence name", value: initalValue })
    if (!recurrenceName) {
      return null
    }
    const recurrencePath = this.deps.path.join(folderSelector.getSpecialFolder("Recurrence"), recurrenceName)
    this.deps.fs.mkdirSync(recurrencePath)
    return recurrencePath
  }
}
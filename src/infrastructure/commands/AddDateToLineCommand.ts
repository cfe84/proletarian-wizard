import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';

export class AddDateToLineCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, context: IContext) {
  }
  get Id(): string { return "pw.addDateToLine" }

  executeAsync = async (): Promise<string | null> => {
    const line = vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor.selection.start)
    vscode.window.showInformationMessage(line?.text || "")
    return ""
  }
}
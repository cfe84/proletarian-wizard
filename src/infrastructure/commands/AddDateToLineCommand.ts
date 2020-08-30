import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { LineOperations } from '../../domain/LineOperations';

export class AddDateToLineCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, context: IContext) {
  }
  get Id(): string { return "pw.addDateToLine" }

  executeAsync = async (): Promise<string | null> => {
    const lineOperations = new LineOperations(this.deps)
    const line = vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor.selection.start)
    const lineText = line?.text || ""
    const range = line?.range
    if (!range) {
      return "ERROR"
    }
    const updatedLine = lineOperations.addDate(lineText)
    vscode.window.showInformationMessage(`${lineText} -> ${updatedLine}`)
    vscode.window.activeTextEditor?.edit((editor) => editor.replace(range, updatedLine))
    return ""
  }
}
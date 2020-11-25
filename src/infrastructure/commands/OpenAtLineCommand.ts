import * as vscode from 'vscode';
import { ICommand } from "./ICommand";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";

export class OpenAtLineCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  executeAsync = async (filepath: string, line: number): Promise<string | null> => {
    this.deps.logger.log(filepath + " " + line)
    await vscode.window.showTextDocument(vscode.Uri.parse(filepath))
    const editor = vscode.window.activeTextEditor
    if (editor) {
      const newSelection = new vscode.Selection(line, 0, line, 0)
      editor.selection = newSelection
      editor.revealRange(newSelection)
      return ""
    }
    return null
  }
  get Id(): string { return "pw.openAtLine" };

}
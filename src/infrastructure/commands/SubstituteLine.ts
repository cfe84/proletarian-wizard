import * as vscode from 'vscode';

export class SubstituteLine {
  static substitute = (substitute: (line: string) => string) => {
    const line = vscode.window.activeTextEditor?.document.lineAt(vscode.window.activeTextEditor.selection.start)
    const lineText = line?.text || ""
    const range = line?.range
    if (!range) {
      throw Error("No line under cursor")
    }
    const updatedLine = substitute(lineText)
    vscode.window.activeTextEditor?.edit((editor) => editor.replace(range, updatedLine))
  }
}
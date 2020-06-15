import * as vscode from 'vscode'
import { IUISelector } from '../../contract/IUISelector';
export class VSUiSelector implements IUISelector {
  async selectSingleOptionAsync(options: string[]): Promise<string | undefined> {
    const res = await vscode.window.showQuickPick(options);
    return res
  }
  async inputStringAsync(prompt: string, initialValue?: string | undefined): Promise<string | undefined> {
    const res = await vscode.window.showInputBox({
      prompt,
      value: initialValue
    })
    return res
  }

}
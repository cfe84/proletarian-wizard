import * as vscode from 'vscode'
import { IUISelector, IUISelectorOption } from '../../contract/IUISelector';

export class VSUiSelector implements IUISelector {
  async selectSingleOptionAsync<T extends IUISelectorOption>(options: T[], title: string): Promise<T | undefined> {
    const res = await vscode.window.showQuickPick(options, {
      placeHolder: title
    });
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
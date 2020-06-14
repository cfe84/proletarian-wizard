import * as vscode from 'vscode';
export class FolderSelector {
  selectFolderAsync = async (): Promise<string | null> => {
    const result = await vscode.window.showQuickPick(["Project", "Recurrence", "Reference", "Inbox"], { canPickMany: false })
    if (result) {
      return result
    } else {
      return null
    }
  }
}
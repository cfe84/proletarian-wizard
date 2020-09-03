import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TodoHierarchicView, SortByOption, SortByConfig, SortByDirection } from '../views/TodoHierarchicView';

class SortByMenuOption {
  constructor(public label: string, public sortByOption: SortByConfig) { }
}

export class SwitchSortByCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext, private todoView: TodoHierarchicView) {
  }
  get Id(): string { return "pw.todoView.sortBy" }

  executeAsync = async (): Promise<string | null> => {
    const currentConfig = this.todoView.sortBy
    const options = [
      new SortByMenuOption(currentConfig.sortDirection === SortByDirection.up ? "Sort down" : "Sort up", { sortByOption: currentConfig.sortByOption, sortDirection: currentConfig.sortDirection === SortByDirection.up ? SortByDirection.down : SortByDirection.up, attributeName: currentConfig.attributeName }),
      new SortByMenuOption("By status", { sortByOption: SortByOption.status, sortDirection: SortByDirection.up }),
      new SortByMenuOption("By project", { sortByOption: SortByOption.project, sortDirection: SortByDirection.up })
    ].concat(this.context.parsedFolder.attributes
      .filter(attributeName => attributeName !== "selected")
      .map(
        attribute => new SortByMenuOption(`By ${attribute}`, { sortByOption: SortByOption.attribute, attributeName: attribute, sortDirection: SortByDirection.up })
      ))
    const option = await vscode.window.showQuickPick(options, { canPickMany: false, placeHolder: "Sort by" })
    if (option) {
      this.todoView.sortBy = option.sortByOption
    }
    return ""
  }
}
import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TodoHierarchicView, GroupByOption } from '../views/TodoHierarchicView';

class GroupByMenuOption {
  constructor(public label: string, public groupByOption: GroupByOption) { }
}

export class SwitchGroupByCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext, private todoView: TodoHierarchicView) {
  }
  get Id(): string { return "pw.todoView.groupBy" }

  executeAsync = async (): Promise<string | null> => {
    const option = await vscode.window.showQuickPick([
      new GroupByMenuOption("By status", GroupByOption.status),
      new GroupByMenuOption("By project", GroupByOption.project)
    ], { canPickMany: false })
    if (option) {
      this.todoView.groupBy = option.groupByOption
    }
    return ""
  }
}
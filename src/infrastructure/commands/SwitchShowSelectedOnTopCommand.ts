import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TodoHierarchicView, GroupByOption } from '../views/TodoHierarchicView';

class ShowSelectedMenuOption {
  constructor(public label: string, public value: boolean) { }
}

export class SwitchSelectedOnTopCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext, private todoView: TodoHierarchicView) {
  }
  get Id(): string { return "pw.todoView.showSelected" }

  executeAsync = async (): Promise<string | null> => {
    const option = await vscode.window.showQuickPick([
      new ShowSelectedMenuOption("Show selected on top", true),
      new ShowSelectedMenuOption("Hide selected todos", false)
    ], { canPickMany: false })
    if (option) {
      this.todoView.showSelectedOnTop = option.value
    }
    return ""
  }
}
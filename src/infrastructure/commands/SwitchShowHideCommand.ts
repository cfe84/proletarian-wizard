import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TodoHierarchicView, GroupByOption } from '../views/TodoHierarchicView';

type voidMethod = () => void
class ShowHideMenuOption {
  constructor(public label: string, public onselect: voidMethod) { }
}

export class SwitchShowHideCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext, private todoView: TodoHierarchicView) {
  }
  get Id(): string { return "pw.todoView.showHide" }

  executeAsync = async (): Promise<string | null> => {
    const option = await vscode.window.showQuickPick([
      new ShowHideMenuOption(`${this.todoView.showSelectedOnTop ? "Hide" : "Show"} selected on top`, () => this.todoView.showSelectedOnTop = !this.todoView.showSelectedOnTop),
    ], { canPickMany: false })
    if (option) {
      option.onselect()
    }
    return ""
  }
}
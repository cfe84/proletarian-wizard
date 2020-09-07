import * as vscode from "vscode";
import { IDependencies } from "../../contract/IDependencies";
import { IContext } from "../../contract/IContext";
import { Completion } from "../../domain/Completion";

export const AttributeCompletionTriggerCharacters = ["@", "("]

export class AttributeCompletionItemProvider implements vscode.CompletionItemProvider {
  private completion: Completion
  constructor(private deps: IDependencies, private context: IContext) {
    this.completion = new Completion(deps, context)
  }
  provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    return this.completion.complete(document.lineAt(position.line).text, position.character).map(proposition => ({ label: proposition }))
  }

}
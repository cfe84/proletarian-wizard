import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TemplateSelector } from '../../domain/TemplateSelector';
import { TemplateProcessor } from '../../domain/TemplateProcessor';
import { IDictionary } from '../../domain/IDictionary';
import { FileSaveSelector } from '../selectors/FileSaveSelector';

export class CreateNoteFromTemplate implements ICommand<string | null> {
  private templateSelector: TemplateSelector
  private fileSaveSelector: FileSaveSelector
  constructor(private deps: IDependencies, context: IContext) {
    this.templateSelector = new TemplateSelector(deps, context)
    this.fileSaveSelector = new FileSaveSelector(deps, context)
  }
  get Id(): string { return "pw.createNoteFromTemplate" }

  private async replaceVariables(templateContent: string): Promise<string | null> {
    const templateProcessor = new TemplateProcessor()
    const variables = templateProcessor.getTemplateVariables(templateContent)
    if (variables.length === 0) {
      return templateContent
    }
    const values: IDictionary<string> = {}
    for (let i = 0; i < variables.length; i++) {
      const variableName: string = variables[i]
      const value = await vscode.window.showInputBox({
        placeHolder: `${variableName}`,
        prompt: `Template variable`
      })
      if (value === undefined) {
        return null
      }
      values[variableName] = value
    }
    templateContent = templateProcessor.replaceVariables(templateContent, variables, values)
    return templateContent
  }

  executeAsync = async (): Promise<string | null> => {
    const path = await this.fileSaveSelector.selectFileDestinationAsync()
    if (!path) {
      return null
    }
    const template = await this.templateSelector.selectTemplateAsync()
    if (!template) {
      return null
    }
    const templateContent =
      template.isEmpty ? "" : `${this.deps.fs.readFileSync(template.path)}`
    const substitutedContent = await this.replaceVariables(templateContent)
    if (substitutedContent === null) {
      return null
    }
    this.deps.fs.writeFileSync(path, substitutedContent)
    const uri = vscode.Uri.file(path);
    const editor = await vscode.window.showTextDocument(uri);
    return template.path
  }
}
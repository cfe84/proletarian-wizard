import * as vscode from 'vscode';
import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import { TemplateSelector } from '../../domain/TemplateSelector';

export class CreateNoteFromTemplate implements ICommand<string | null> {
  private templateSelector: TemplateSelector
  constructor(private deps: IDependencies, context: IContext) {
    this.templateSelector = new TemplateSelector(deps, context)
  }
  get Id(): string { return "pw.createNoteFromTemplate" }

  executeAsync = async (): Promise<string | null> => {
    const templatePath = await this.templateSelector.selectTemplateAsync()
    if (!templatePath) {
      return null
    }
    const templateContent = `${this.deps.fs.readFileSync(templatePath)}`
    const uri = vscode.Uri.parse("untitled: New note.md");
    const editor = await vscode.window.showTextDocument(uri);
    editor.edit(edit => edit.insert(new vscode.Position(0, 0), templateContent))
    return templatePath
  }
}
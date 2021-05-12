import * as vscode from 'vscode'
import { ICommand } from "./ICommand"
import { IDependencies } from "../../contract/IDependencies"
import { IContext } from "../../contract/IContext"
import { FolderSelector } from "../../domain/FolderSelector"
import { dir } from 'console'
import { DateTime } from 'luxon'

export class OpenDailyNoteCommand implements ICommand<string | null> {
  constructor(private deps: IDependencies, private context: IContext) {
  }
  executeAsync = async (): Promise<string | null> => {
    const file = this.getDailyNoteFileName()
    if (!this.deps.fs.existsSync(file)) {
      this.createDailyNoteFromTemplate(file)
    }
    vscode.window.showTextDocument(vscode.Uri.file(file))
    return file
  }

  // Todo: this should be configurable
  private getDailyNoteFileName() {
    const folderSelector = new FolderSelector({ allowThisFolder: true }, this.deps, this.context)
    const date = DateTime.now().toISODate()
    const name = `${date} - daily-notes.md`
    const file = this.deps.path.join(folderSelector.getSpecialFolder("Recurrence"), "daily-notes", name)
    return file
  }

  private createDailyNoteFromTemplate(file: string) {
    // Todo: this should be extracted in its own logic
    const templateFile = this.deps.path.join(this.context.templatesFolder, "daily-notes.md")
    const template = this.deps.fs.readFileSync(templateFile).toString()
    const directory = this.deps.path.dirname(file)
    if (!this.deps.fs.existsSync(directory)) {
      throw Error(`Path does not exit: ${directory}`)
    }
    this.deps.fs.writeFileSync(file, template)
  }

  get Id(): string { return "pw.openDailyNote" }

}
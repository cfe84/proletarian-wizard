import { ICommand } from './ICommand';
import { IDependencies } from '../../contract/IDependencies';
import { IContext } from '../../contract/IContext';
import * as childprocess from "child_process"

interface File {
  fsPath: string,
  external: string,
  path: string,
  scheme: string,
  _sep: number
}

export class OpenExternalDocument implements ICommand<string | null> {
  constructor(private deps: IDependencies, context: IContext) {
  }
  get Id(): string { return "pw.openExternalDocument" }

  executeAsync = async (file: File): Promise<string | null> => {
    this.deps.logger.log(`Open ${file.fsPath}`)
    childprocess.exec(`"${file.fsPath}"`, (error) => {
      if (error) {
        this.deps.logger.error(error.message)
      }
    })
    return ""
  }
}
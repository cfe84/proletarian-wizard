import { ILogger } from "../contract/ILogger";
import * as vscode from 'vscode';

export class ConsoleLogger implements ILogger {
  private connection: vscode.OutputChannel
  constructor() {
    this.connection = vscode.window.createOutputChannel("Extension: Proletarian Wizard")
  }
  log(msg: string): void {
    this.connection.appendLine(`LOG:   ${msg}`)
  }
  warn(msg: string): void {
    this.connection.appendLine(`WARN:  ${msg}`)
  }
  error(msg: string): void {
    this.connection.appendLine(`ERROR: ${msg}`)
  }


}
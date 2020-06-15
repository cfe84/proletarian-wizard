export interface ICommand {
  Id: string;
  executeAsync(): Promise<void>
}
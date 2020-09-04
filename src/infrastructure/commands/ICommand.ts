export interface ICommand<T> {
  Id: string;
  executeAsync(...parameters: any[]): Promise<T>
}
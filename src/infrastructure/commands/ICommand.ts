export interface ICommand<T> {
  Id: string;
  executeAsync(): Promise<T>
}
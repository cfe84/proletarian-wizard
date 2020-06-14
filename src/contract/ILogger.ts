export interface ILogger {
  log(msg: string): void
  warn(msg: string): void
  error(msg: string): void
}
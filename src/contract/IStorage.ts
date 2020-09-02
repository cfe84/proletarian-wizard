export interface IStorage {
  update(key: string, value: any): void
  get<T>(key: string, defaultValue: T): T
}
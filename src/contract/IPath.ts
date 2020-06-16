export interface IPath {
  basename(name: string): string
  join(...segments: string[]): string
}
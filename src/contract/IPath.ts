export type path = string;
export type filename = string;

export interface IPath {
  basename(name: path): filename
  join(...segments: path[] | filename[]): path
  sep: string
}
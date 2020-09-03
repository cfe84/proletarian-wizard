import { IDependencies } from '../contract/IDependencies';

export interface SelectFolderProps {
  allowCreateFolder?: boolean
}

export class FileSelector {
  constructor(private deps: IDependencies) { }

  selectFileAsync = async (folder: string): Promise<string | null> => {
    const files = this.deps.fs
      .readdirSync(folder)
      .map(f => ({
        fullpath: this.deps.path.join(folder, f),
        name: f
      }))
      .filter(f => !this.deps.fs.lstatSync(f.fullpath).isDirectory())
    const pick = await this.deps.uiSelector.selectSingleOptionAsync(files.map(f => ({ label: f.name, file: f })), "Pick file");
    if (!pick) {
      return null
    }
    return pick?.file.fullpath || null
  }
}
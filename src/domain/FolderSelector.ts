import { IDependencies } from '../contract/IDependencies';
import { IDictionary } from './IDictionary';

const defaultInboxFolder: string = "10 - Inbox"
const defaultProjectsFolder: string = "20 - Current Projects"
const defaultRecurrenceFolder: string = "21 - Recurrence"
const defaultReferenceFolder: string = "30 - Reference"
const defaultArchiveFolder: string = "40 - Archive"

export interface SelectFolderProps {
  allowCreateFolder?: boolean
}

export class FolderSelector {

  private folders: IDictionary<string> = {
    "Project": defaultProjectsFolder,
    "Inbox": defaultInboxFolder,
    "Recurrence": defaultRecurrenceFolder,
    "Reference": defaultReferenceFolder,
    "Archive": defaultArchiveFolder
  }

  constructor(private deps: IDependencies, private root: string) { }

  private selectSubfolderAsync = async (folder: string): Promise<string | null> => {
    const folders = this.deps.fs
      .readdirSync(folder)
      .map(f => ({
        fullpath: this.deps.path.join(folder, f),
        name: f
      }))
      .filter(f => this.deps.fs.lstatSync(f.fullpath).isDirectory())
    const pick = await this.deps.uiSelector.selectSingleOptionAsync(folders.map(f => f.name));
    if (!pick) {
      return null
    }
    const pickFolder = folders.find(f => f.name === pick)
    return pickFolder?.fullpath || null
  }

  selectFolderAsync = async (): Promise<string | null> => {

    const result = await this.deps.uiSelector.selectSingleOptionAsync(["Project", "Recurrence", "Inbox", "Reference"])
    if (result) {
      const folder = this.deps.path.join(this.root, this.folders[result])
      switch (result) {
        case "Project":
        case "Recurrence":
        case "Reference":
          return await this.selectSubfolderAsync(folder) || null;
        case "Inbox":
        default:
          return folder
      }
    } else {
      return null
    }
  }
}
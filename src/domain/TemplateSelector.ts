import { IDependencies } from "../contract/IDependencies";
import { IContext } from "../contract/IContext";

const defaultConfigFolder = ".pw"
const defaultTemplateFolder = "templates"

export class TemplateSelector {
  private templateFolder: string
  constructor(private deps: IDependencies, private context: IContext) {
    this.templateFolder = deps.path.join(context.rootFolder, defaultConfigFolder, defaultTemplateFolder)
  }

  selectTemplateAsync = async (): Promise<string | null> => {
    const templateNames = this.deps.fs.readdirSync(this.templateFolder)
    const templates = templateNames.map((template) => ({
      name: template.replace(/.md$/i, ""),
      path: this.deps.path.join(this.templateFolder, template)
    }))
    const selectedTemplateName = await this.deps.uiSelector.selectSingleOptionAsync(templates.map(template => template.name)) as string
    if (selectedTemplateName === undefined) {
      return null
    }
    return templates.find(template => template.name === selectedTemplateName)?.path || null
  }
}
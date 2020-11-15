import { IDependencies } from "../contract/IDependencies";
import { IContext } from "../contract/IContext";
import { IUISelectorOption } from "../contract/IUISelector";

const defaultConfigFolder = ".pw"
const defaultTemplateFolder = "templates"

interface TemplateOption {
  name: string
  path: string
  isEmpty: boolean
}

export class TemplateSelector {
  private templateFolder: string
  constructor(private deps: IDependencies, private context: IContext) {
    this.templateFolder = context.templatesFolder
  }

  selectTemplateAsync = async (): Promise<TemplateOption | null> => {
    let templateNames: string[] = []
    if (this.deps.fs.existsSync(this.templateFolder)) {
      templateNames = this.deps.fs.readdirSync(this.templateFolder)
    }
    const templates: TemplateOption[] = [{ name: "<Empty>", isEmpty: true, path: "" }].concat(templateNames.map((template) => ({
      name: template.replace(/.md$/i, ""),
      path: this.deps.path.join(this.templateFolder, template),
      isEmpty: false
    })))
    const selectedTemplate = await this.deps.uiSelector.selectSingleOptionAsync(templates.map(template => ({ label: template.name, template })), "Template name")
    if (selectedTemplate === undefined) {
      return null
    }
    return selectedTemplate.template || null
  }
}
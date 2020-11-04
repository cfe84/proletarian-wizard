import { IDependencies } from "../contract/IDependencies";
import { IDictionary } from "./IDictionary";

export type TemplateVariableName = string

export class TemplateProcessor {
  constructor() { }

  getTemplateVariables(templateContent: string): TemplateVariableName[] {
    const regex = /\${([a-z0-9_ .?!,;-]+)}/mig
    const res = templateContent.match(regex)?.map(r => r.substr(2, r.length - 3)) || []
    return res.filter((elementA, index) =>
      // Remove duplicates case insensitive
      res.findIndex(elementB => elementA.toLowerCase() === elementB.toLowerCase()) === index
    )
  }

  replaceVariables(templateContent: string, variables: TemplateVariableName[], values: IDictionary<string>): string {
    variables.forEach(variableName => {
      const regex = new RegExp("\\${" + variableName + "}", "gi")
      const value = values[variableName]
      templateContent = templateContent.replace(regex, value)
    })
    return templateContent
  }
}
import { makeFakeDeps } from "./FakeDeps"
import * as td from "testdouble"
import * as should from "should"
import { TemplateSelector } from "../src/domain/TemplateSelector"
import { fakeContext } from "./FakeContext"


describe("Template selector", () => {
  // given
  const deps = makeFakeDeps()
  const context = fakeContext()
  const templateSelector = new TemplateSelector(deps, context)

  const templatesFileNames = ["template1.md", "temp2.md", "123.md"]
  const templatesFileNamesNoExt = ["template1", "temp2", "123"]

  const defaultTemplateFolder = "ROOT|.pw|templates"

  // it("gives a choice between all templates", async () => {
  //   // given
  //   td.when(deps.fs.readdirSync(defaultTemplateFolder)).thenReturn(templatesFileNames)
  //   // when
  //   const template = await templateSelector.selectTemplateAsync()
  //   // then
  //   td.verify(deps.uiSelector.selectSingleOptionAsync(templatesFileNamesNoExt))
  // })

  // it("returns the selected template file", async () => {
  //   // given
  //   td.when(deps.fs.readdirSync(defaultTemplateFolder)).thenReturn(templatesFileNames)
  //   td.when(deps.uiSelector.selectSingleOptionAsync(templatesFileNamesNoExt))
  //     .thenResolve("temp2")
  //   // when
  //   const template = await templateSelector.selectTemplateAsync()
  //   // then
  //   should(template).eql(`${defaultTemplateFolder}|temp2.md`)
  // })

  // it("returns null when not selecting a template file", async () => {
  //   // given
  //   td.when(deps.fs.readdirSync(defaultTemplateFolder)).thenReturn(templatesFileNames)
  //   td.when(deps.uiSelector.selectSingleOptionAsync(templatesFileNamesNoExt))
  //     .thenResolve(undefined)
  //   // when
  //   const template = await templateSelector.selectTemplateAsync()
  //   // then
  //   should(template).be.null()
  // })
})
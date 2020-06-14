import { makeFakeDeps } from "./FakeDeps"
import { FileNameAssembler } from "../src/domain/FileNameAssembler"
import * as td from "testdouble"
import * as should from "should"

describe("FileNameAssembler", () => {
  // given
  const deps = makeFakeDeps()
  const fileNameAssembler = new FileNameAssembler(deps)

  context("Fixing markdown extension", () => {
    it("adds missing markdown extension", () => {
      const filename1 = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something", path: "" })
      should(filename1).endWith("2020-01-10 - something.md")

      const filename2 = fileNameAssembler.assembleFileName({ fileName: "something", path: "" })
      should(filename2).endWith("something.md")
    })

    it("adds missing markdown extension even if there's an .md somewhere in the name", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.mdsomewhereinthename", path: "" })
      should(filename).endWith("2020-01-10 - something.mdsomewhereinthename.md")
    })

    it("doesn't add an addition markdown extension when already there", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.md", path: "" })
      should(filename).endWith("2020-01-10 - something.md")
    })

    it("doesn't add an addition markdown extension when capitalized md already there", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-10 - something.MD", path: "" })
      should(filename).endWith("2020-01-10 - something.MD")
    })
  })

  context("Fixing date prefix in filename", () => {
    before(() =>
      td.when(() => deps.date.todayAsYMDString()).thenReturn("_DATE_")
    )
    it("adds date as prefix if missing", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "something", path: "" })
      should(filename).containEql("_DATE_ - something")
    })
    it("does not add date as prefix if it's there", () => {
      const filename = fileNameAssembler.assembleFileName({ fileName: "2020-01-02 - something.md", path: "" })
      should(filename).containEql("2020-01-02 - something")
      should(filename).not.containEql("_DATE_")
    })
  })
})
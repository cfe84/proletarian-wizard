import { makeFakeDeps } from "./FakeDeps";
import { fakeContext } from "./FakeContext";
import { IContext } from "../src/contract/IContext";
import { FileInspector, InspectionResults } from "../src/domain/FileInspector";
import should from "should";

describe("File inspector", () => {
  // given
  const deps = makeFakeDeps();
  const ctx: IContext = fakeContext();

  const inspector = new FileInspector(deps, ctx);

  context("File name", () => {
    it("finds inbox correctly", () => {
      const res = inspector.inspect("ROOT|INBOX|file.md");
      should(res.containingFolderType).equal("inbox");
      should(res.name).equal("file.md");
      should(res.project).equal("");
    });

    it("finds project correctly", () => {
      const res = inspector.inspect(
        "ROOT|PROJECTS|2020-01-02 - Something|file2.md"
      );
      should(res.containingFolderType).equal("projects");
      should(res.name).equal("file2.md");
      should(res.project).equal("2020-01-02 - Something");
    });

    it("handles files in subfolders of project correctly", () => {
      const res = inspector.inspect(
        "ROOT|PROJECTS|2020-01-02 - Something|sub|file2.md"
      );
      should(res.containingFolderType).equal("projects");
      should(res.name).equal("sub|file2.md");
      should(res.project).equal("2020-01-02 - Something");
    });

    it("handles files in root of projects folder", () => {
      const res = inspector.inspect("ROOT|PROJECTS|file2.md");
      should(res.containingFolderType).equal("projects");
      should(res.name).equal("file2.md");
      should(res.project).equal("BASENAME(file2.md)");
    });

    it("handles files in root of recurrence folder", () => {
      const res = inspector.inspect("ROOT|RECURRENCES|file2.md");
      should(res.containingFolderType).equal("recurrences");
      should(res.name).equal("file2.md");
      should(res.project).equal("BASENAME(file2.md)");
    });

    it("handles files in sub of recurrence folder", () => {
      const res = inspector.inspect("ROOT|RECURRENCES|1-1|file2.md");
      should(res.containingFolderType).equal("recurrences");
      should(res.project).equal("1-1");
      should(res.name).equal("file2.md");
    });

    it("handles files in root folder", () => {
      const res = inspector.inspect("ROOT|file2.md");
      should(res.containingFolderType).equal("");
      should(res.project).equal("");
      should(res.name).equal("file2.md");
    });

    it("handles files out of structure folder", () => {
      const res = inspector.inspect("ROOT|Somewhere|file2.md");
      should(res.containingFolderType).equal("");
      should(res.project).equal("");
      should(res.name).equal("Somewhere|file2.md");
    });
  });
  context("Project name", () => {
    it("processes out of format project name", () => {
      const res = inspector.inspectProject("asdf");
      should(res.projectName).equal("asdf");
      should(res.date).be.undefined();
    });
    it("processes project and date", () => {
      const res = inspector.inspectProject("2020-12-01 - asdf");
      should(res.projectName).equal("asdf");
      should(res.date).equal("2020-12-01");
    });
    it("processes wrong format", () => {
      const res = inspector.inspectProject("2020-ma-12 - asdf");
      should(res.projectName).equal("2020-ma-12 - asdf");
      should(res.date).be.undefined();
    });
  });
});

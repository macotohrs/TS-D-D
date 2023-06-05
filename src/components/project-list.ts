import { IDragTarget } from "../models/drag-drop.js";
import { Component } from "./base-component.js";
import { Project, ProjectStatus } from "../models/project.js";
import { autoBind } from "../decorators/autobind.js";
import { projectState } from "../state/project.js";
import { ProjectItem } from "./project-item.js";

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements IDragTarget
{
  assignedProjects: Project[]; // <section>

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    // 要素への参照を取得する作業
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul");
      if (listEl) {
        listEl.classList.add("droppable");
      }
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.changeProjectStatus(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector("ul");
    if (listEl) {
      listEl.classList.remove("droppable");
    }
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler)!;
    this.element.addEventListener("drop", this.dropHandler)!;
    this.element.addEventListener("dragleave", this.dragLeaveHandler)!;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(listEl.id, prjItem);
    }
  }
}

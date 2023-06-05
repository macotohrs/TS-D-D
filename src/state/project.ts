import { Project, ProjectStatus } from "../models/project";

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = []; // protected継承先のクラスからならアクセスできる（他はダメ）

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState; //インスタンスを保持するためのprop
  private constructor() {
    super();
    // シングルトン
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  private updateListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }

  addProject(title: string, description: string, manday: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      manday,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  // D&Dでproject.stateを変える
  changeProjectStatus(projectId: string, newStatus: ProjectStatus) {
    // ここでListにアクセスする
    const project = this.projects.find((p) => p.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
}

export const projectState = ProjectState.getInstance(); // 他のクラスのようにnewするのではなく、getInstanceの処理で常にインスタンスが一つになるようにする

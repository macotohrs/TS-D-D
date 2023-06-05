/// <reference path="drag-drop-interfaces.ts" />
/// <reference path="project-model.ts" />

namespace App {
  // Project State Management
  type Listener<T> = (items: T[]) => void;

  class State<T> {
    protected listeners: Listener<T>[] = []; // protected継承先のクラスからならアクセスできる（他はダメ）

    addListener(listenerFn: Listener<T>) {
      console.log("初回");
      this.listeners.push(listenerFn);
    }
  }

  class ProjectState extends State<Project> {
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
      console.log("2");
      for (const listenerFn of this.listeners) {
        listenerFn(this.projects.slice());
      }
    }

    addProject(title: string, description: string, manday: number) {
      console.log("1");
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

  const projectState = ProjectState.getInstance(); // 他のクラスのようにnewするのではなく、getInstanceの処理で常にインスタンスが一つになるようにする

  interface IValidation {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  }

  function validate(input: IValidation) {
    let isValid = true;
    if (input.required) {
      if (typeof input.value === "string") {
        isValid = isValid && input.value.trim().length > 0;
      }
    }
    if (input.minLength && typeof input.value === "string") {
      isValid = isValid && input.value.length >= input.minLength;
    }
    if (input.maxLength && typeof input.value === "string") {
      isValid = isValid && input.value.length >= input.maxLength;
    }
    if (input.min && typeof input.value === "number") {
      isValid = isValid && input.value >= input.min;
    }
    if (input.max && typeof input.value === "number") {
      isValid = isValid && input.value <= input.max;
    }
    return isValid;
  }

  // autoBind decorator
  function autoBind(
    _target: any,
    _methodName: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const adDescriptor: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        const boundFn = originalMethod.bind(this);
        return boundFn;
      },
    };
    return adDescriptor;
  }

  abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    // abstract 常に継承されて使われる (→ インスタンス化できなくする)
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
      templateId: string,
      hostElementId: string,
      insertAtStart: boolean,
      newElementId?: string
    ) {
      this.templateElement = document.getElementById(
        templateId
      )! as HTMLTemplateElement;
      this.hostElement = document.getElementById(hostElementId)! as T; // 表示先のhostElementの型

      const importedHTML = document.importNode(
        this.templateElement.content,
        true
      )!;
      this.element = importedHTML.firstElementChild as U;
      if (newElementId) {
        this.element.id = newElementId;
      }
      this.attach(insertAtStart);
    }
    abstract configure(): void; // abstractで定義した場合、継承したクラス(サブクラス)で処理内容を必ず定義
    abstract renderContent(): void;

    private attach(insertAtBeginning: boolean) {
      console.log("ProjectList attach");
      // 送信した値を描画する
      this.hostElement.insertAdjacentElement(
        insertAtBeginning ? "afterbegin" : "beforeend",
        this.element
      );
    }
  }

  // 一つ一つのアイテムをリストの項目として表示するためのクラス
  class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements IDraggable
  {
    private project: Project;

    get manday() {
      if (this.project.manday < 20) {
        return this.project.manday.toString() + "人日";
      } else {
        return (this.project.manday / 20).toString() + "人月";
      }
    }

    constructor(hostId: string, project: Project) {
      super("single-project", hostId, false, project.id);
      this.project = project;
      this.configure();
      this.renderContent();
    }

    @autoBind
    dragStartHandler(event: DragEvent): void {
      event.dataTransfer!.setData("text/plain", this.project.id);
      event.dataTransfer!.effectAllowed = "move";
    }

    dragEndHandler(_: DragEvent): void {}
    configure() {
      this.element.addEventListener("dragstart", this.dragStartHandler);
      this.element.addEventListener("dragend", this.dragStartHandler);
    }

    renderContent() {
      this.element.querySelector("h2")!.textContent = this.project.title;
      this.element.querySelector("h3")!.textContent = this.manday;
      this.element.querySelector("p")!.textContent = this.project.description;
    }
  }

  // 描画させたい
  class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements IDropTarget
  {
    assignedProjects: Project[]; // <section>

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);
      // 要素への参照を取得する作業
      this.hostElement = document.getElementById("app")! as HTMLDivElement; // テンプレートを表示する親要素(id='app')への参照
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
      console.log("renderContent");
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector("h2")!.textContent =
        this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
    }

    private renderProjects() {
      console.log("renderProjects"); // 最後
      const listEl = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      listEl.innerHTML = "";
      for (const prjItem of this.assignedProjects) {
        new ProjectItem(listEl.id, prjItem);
      }
    }
  }

  class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    mandayInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      // 要素への参照を取得する作業
      this.templateElement = document.getElementById(
        "project-input"
      )! as HTMLTemplateElement; // <template>要素への参照
      this.hostElement = document.getElementById("app")! as HTMLDivElement; // テンプレートを表示する親要素(id='app')への参照

      this.titleInputElement = this.element.querySelector(
        "#title"
      ) as HTMLInputElement; // <input type="text" id="title" />
      this.descriptionInputElement = this.element.querySelector(
        "#description"
      ) as HTMLInputElement; // <textarea id="description" rows="3"></textarea>
      this.mandayInputElement = this.element.querySelector(
        "#manday"
      ) as HTMLInputElement; // <input type="number" id="manday" step="1" min="0" max="10000" />

      this.configure();
    }

    // 3つのフォームすべてにアクセスしてユーザの入力値を取得。入力値が正しいかバリデーションを行う。バリデーションを行った結果を返す
    private allInputContent(): [string, string, number] | void {
      console.log("allInputContent"); // 最初
      // 入力値を取得
      const inputTitle = this.titleInputElement.value;
      const inputDescription = this.descriptionInputElement.value;
      const inputManday = this.mandayInputElement.value;

      const titleV: IValidation = {
        value: inputTitle,
        required: true,
      };
      const descriptionV: IValidation = {
        value: inputDescription,
        required: true,
        minLength: 5,
      };
      const mandayV: IValidation = {
        value: +inputManday,
        required: true,
        min: 1,
        max: 1000,
      };
      if (!validate(titleV) || !validate(descriptionV) || !validate(mandayV)) {
        alert("入力値が正しくありません！");
      } else {
        return [inputTitle, inputDescription, +inputManday];
      }
    }

    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent() {}

    private clearInputs() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.mandayInputElement.value = "";
    }

    // 各項目に入力された値を見る
    @autoBind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.allInputContent();
      if (Array.isArray(userInput)) {
        const [title, description, manday] = userInput;
        projectState.addProject(title, description, manday);
      }
      this.clearInputs();
    }
  }
  new ProjectInput();
  new ProjectList("active");
  new ProjectList("finished");
}

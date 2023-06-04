// Project Type クラスで型を定義する
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public manday: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState; //インスタンスを保持するためのprop
  private constructor() {
    // シングルトン
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  private notifyListeners() {
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
    this.notifyListeners();
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

// 描画させたい
class ProjectList {
  templateElement: HTMLTemplateElement; // <template id="project-list">
  hostElement: HTMLDivElement; //  <div id="app"></div>
  element: HTMLElement; // <section>
  assignedProjects: Project[]; // <section>

  constructor(private type: "active" | "finished") {
    // 要素への参照を取得する作業
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement; // <template>要素への参照
    this.hostElement = document.getElementById("app")! as HTMLDivElement; // テンプレートを表示する親要素(id='app')への参照
    this.assignedProjects = [];

    const importedHTML = document.importNode(
      this.templateElement.content,
      true
    )!;
    this.element = importedHTML.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if (this.type === "active") {
          return (project.status === ProjectStatus.Active);
        }
          return (project.status === ProjectStatus.Finished);
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl?.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type === "active" ? "実行中プロジェクト" : "完了プロジェクト";
  }

  private attach() {
    // 送信した値を描画する
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement; // <template id="project-input">
  hostElement: HTMLDivElement; //  <div id="app"></div>
  element: HTMLFormElement; // <From>

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  constructor() {
    // 要素への参照を取得する作業
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement; // <template>要素への参照
    this.hostElement = document.getElementById("app")! as HTMLDivElement; // テンプレートを表示する親要素(id='app')への参照

    const importedHTML = document.importNode(
      this.templateElement.content,
      true
    )!;
    this.element = importedHTML.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

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
    this.attach();
  }

  // 3つのフォームすべてにアクセスしてユーザの入力値を取得。入力値が正しいかバリデーションを行う。バリデーションを行った結果を返す
  private allInputContent(): [string, string, number] | void {
    // タプルかundefinedを返す
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

  // イベントリスナーの設定
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  // 要素を追加する作業
  private attach() {
    // フォームを描画する
    this.hostElement.insertAdjacentElement("afterbegin", this.element); // 第一引数はどこに追加するかのオプション
  }
}
const prjInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");

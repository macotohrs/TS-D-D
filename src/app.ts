class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.attach();
  }

  private attach() {
    // 開始した直後にテンプレートからimportした要素を追加する
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const prjInput = new ProjectInput();
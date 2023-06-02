function AutoBind(_target: any, _methodName: string | Symbol | number, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value; // value : ƒ submitHandler(event)
  const updatedDescriptor: PropertyDescriptor = {
    configurable: true, // プロパティを変更するようにする
    enumerable: false,
    get() { // getterで参照したいオブジェクトをbindする  // オリジナルの関数をアクセスした時に実行される
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  console.log(updatedDescriptor)
  return updatedDescriptor;
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  mandayInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input' // cssのidを適用
    
    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.mandayInputElement = this.element.querySelector("#manday") as HTMLInputElement;

    this.configure();
    this.attach();
  }

  // イベントのオブジェクトを受け取る
  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.log(this.titleInputElement.value);
  }

  // イベントリスナーの設定
  private configure() {
    this.element.addEventListener("submit", this.submitHandler)
  }

  // 要素を追加
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const prjInput = new ProjectInput();
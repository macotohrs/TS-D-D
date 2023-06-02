function AutoBind(_target: any, _methodName: string | Symbol | number, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const updatedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
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

  // submitHandlerから呼び出したい
  // 入力値のバリデーションをする関数(戻り値 → title, description, manday)
  private gatherUserInput() : [string, string, number] | void { // 戻り値にundefinedは定義しない
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredManday = this.mandayInputElement.value; 

    // バリデーションの内容を改善させてみる
    if (enteredTitle.trim().length === 0 ||
        enteredDescription.trim().length === 0 ||
        enteredManday.trim().length === 0
    ) {
      alert('入力値が正しくありません 再度お試しください')
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredManday]; // + Number型に変換
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.mandayInputElement.value = '';
  }

  // イベントのオブジェクトを受け取る
  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    // userInputがタプル型か確認したい
    // → タプル : 型が決まった配列 ... 配列かどうかをみる & 引数にとって中身を確認
    if (Array.isArray(userInput)) {
      const [title, desc, manday] = userInput;
      console.log(title, desc, manday)
      this.clearInputs();
    }
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
/// <reference  path="base-component.ts"/>

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}

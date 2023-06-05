namespace App {
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
      // 送信した値を描画する
      this.hostElement.insertAdjacentElement(
        insertAtBeginning ? "afterbegin" : "beforeend",
        this.element
      );
    }
  }
}

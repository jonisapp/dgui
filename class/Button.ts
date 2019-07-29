export class Button {
  elm: HTMLElement;
  parent: Form;

  constructor (parent, label, button_BScolor_class) {
    this.parent = parent;
    this.elm = document.createElement("button");
    this.elm.setAttribute("class", "btn "+ button_BScolor_class);
    this.elm.setAttribute("style", "text-align: center; margin-left: 5px; margin-right: 5px; min-width: 70px");
    this.elm.textContent = label;
  }

  setFunction(actionFunction) {
    this.elm.addEventListener("click", (e) => {
      actionFunction();
    });
  }

  setAction(action) {
    var that = this;
    switch(action) {
      case "quit": this.elm.addEventListener("click", function(e) {
        that.parent.quit();
      }); break;
      case "submit": this.elm.addEventListener("click", function(e) {
        that.parent.submit();
      }); break;
      case "confirm": this.elm.addEventListener("click", function(e) {
        that.parent.confirm();
      }); break;
      case "abort": this.elm.addEventListener("click", function(e) {
        that.parent.abort();
      }); break;
    }
  }
}
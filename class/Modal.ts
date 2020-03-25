import { Translucent } from './Translucent';
import { Form } from './Form';

export class Modal {
  background: Translucent;
  formPannel: Form;
  feedback: Function;

  constructor(formInitializer, feedback) {
    if(formInitializer != null) {
      //this.clean = formInitializer.clean;
      this.feedback = feedback;
      this.background = new Translucent();
      this.formPannel = new Form(formInitializer, this);
      this.background.elm.appendChild(this.formPannel.elm);
      document.body.appendChild(this.background.elm);
      this.formPannel.init();
    }
  }
  quit() {
    this.background.del();
  }

  submit(form) {
    console.log('SUBMITMODAL');
    this.feedback(form);
    //this.background.del();
  }

  confirm() {
    this.feedback(true);
    this.background.del();
  }

  abort() {
    //this.clean();
    //this.feedback(false);
    this.background.del();
  }
}
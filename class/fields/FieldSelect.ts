import { AbstractField } from './AbstractField';

export class FieldSelect extends AbstractField {
  input_elm: HTMLSelectElement;
  list: Array<string>;
  action: Function;

  constructor(attr, parent) {
    super(attr, parent);
    var that = this;
    this.list = (attr.list) ? attr.list : [];
    if(this.list.length == 0) this.hide();
    this.value = parseInt(attr.initValue);
    this.initLabel();
    this.input_elm = document.createElement("select");
    this.input_elm.setAttribute("class", "dgui-field-text");
    this.generateList(this.list);
    if(this.label) {
      this.elm.appendChild(this.label_elm);
    }
    this.elm.appendChild(this.input_elm);
  }

  generateList(list) {
    if(list) {
      list.forEach((list_item, i) => {
        let option = document.createElement("option");
        option.setAttribute("value", (typeof list_item === "string") ? i.toString() : list_item.value);
        option.textContent = (typeof list_item === "string") ? list_item : list_item.label;
        this.input_elm.appendChild(option);
      });
      this.input_elm.value = this.value;
      this.input_elm.addEventListener("input", (e) => {
        this.value = e.currentTarget.value;
      });
      if(typeof this.action === "function") {
        this.input_elm.addEventListener("input", (e) => {
          this.action(e.currentTarget.value);
        });
      }
    }
  }

  clearList() {
    this.input_elm.innerHTML = "";
  }

  clearValue() {
    this.input_elm.value = "0";
  }

  checkCondition1(a, b) {
    return (a == b);
  }

  testAnd(conditions) {
    var counter = 0;
    conditions.forEach((condition) => {
      this.parent.fields.forEach((field) => {
        if(condition.key == field.key) {
          if(this.checkCondition1(condition.value, field.value)) {
            ++counter;
          }
        }
      })
    });
    return (counter == conditions.length);
  }

  multipleCondition(c) {
    console.log("multipleCondition");
    if(c.$and != undefined) {
      if(this.testAnd(c.$and)) {
        if(c.list !== undefined) {
          this.clearList();
          this.generateList(c.list);
          this.show();
          // this.clearValue();
        }
      }
    }

    else {
      this.clearList();
      this.hide();
    }
  }

  getField(fields, key) {
    for(let i=0; i < fields.length; ++i) {
      if(fields[i].key == key) {
        return fields[i];
      }
    }
  }

  testConditions(keys) {
    var fields = this.parent.getFields(keys);
    var fulfilled = false;
    this.condition.forEach((condition) => {
      if(condition.$eq) {
        let field = this.getField(fields, condition.$eq.key);
        if(condition.$eq.value == field.value) {
          fulfilled = true;
          if(condition.list) {
            this.clearList();
            this.generateList(condition.list);
          }
          this.show();
        }
      }
      else if(condition.$and) {
        var counter = 0;
        condition.$and.forEach((condition_part) => {
          let field = this.getField(fields, condition_part.key);
          if(condition_part.value == field.value) {
            ++counter;
          }
        });
        if(counter == condition.$and.length) {
          fulfilled = true;
          if(condition.list) {
            this.clearList();
            this.generateList(condition.list);
          }
          this.show();
        }
      }
    });
    if(!fulfilled) {
      this.clearList();
      this.hide();
    }
  }

  singleCondition(sourceField, op) {
    console.log("single condition");
    if(this.checkCondition1(sourceField.value, op.$eq.value)) {
      if(op.list !== undefined) {console.log("single condition");
        this.clearList();
        this.generateList(op.list);
        this.show();
        // this.clearValue();
      }
    }
    else {
      this.clearList();
      this.hide();
    }
  }
}
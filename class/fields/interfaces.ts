export interface field_descriptor {
  type: "message" | "button" | "text" | "password" | "number" | "choice" | "switch" | "switchGroup" | "select" | "selectMany" | "date" | "duration";
  key: string;
  label: string;
  required: boolean;
  initValue: string | boolean | number | Array<string> | Array<number> | Array<boolean>;
  size: number;
  placeholder: string;
  action: any;
  condition: boolean | field_condition;
  BSClass: string;
  htmlAttr: {};                                                  // standard HTML attributs
  cssAttr: {};                                                   // standard CSS attributs
  list: Array<string> | Array<Object>;                           // for type select
  group: string;                                                 // for type switch
  radioButtons: Array<field_radioButton>;                        // for type choice
  max: number;
  align: string;
  step: string;
  display: "noLabel" | "";
}

export interface field_radioButton {
  // user
  label: string;
  value: string;
  // controller
  input_elm: HTMLInputElement;
  label_elm: HTMLLabelElement;
}

export interface field_condition {
  key: string;
  hasValue: string | number | Array<string> | Array<number>;        // If field of key [key] has value [value], display the field
  operator: "==" | "!=" | "<" | ">" | "<=" | ">=" | "hasChanged";
  action: "show" | "sync";
}
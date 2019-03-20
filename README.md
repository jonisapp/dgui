# dGUI - Interface elements generator library including data and events handling

1. [Overview](#1)
1. [Code examples](#2)
1. [API documentation](#3)
	1. [API documentation](#3_1)
	1. [API documentation](#3_2)

## <a name="1"></a> 1. Overview
### Use cases
* Meteor applications (dGUI was developped in this context)
* All kinds of Webapps
* Cloud computing platforms
### To whom is it addressed ?
* Developpers who want to **focus on data and logic** rather than graphics
* People who believe in "one task at a time design" philosphy
### Features
* The view is entirely self-generated
* Clean and **simple syntax**
* A lot of **code economy**
* integrate well in any kind of environment
* default labels's **translations** are avaible in **english** and **french**
* form elements
* MDI elements
* modals
* contextual menus
* (soon) selection tool
* (soon) theming
### Why is dGUI a powerful tool ?
* You write a **few lines**, you get the **equivalent of hundreds of lines** of HTML, javascript and CSS code.
* The generated code stays cached only as long as your interface need it.
* Managing server requests can sometimes be very tricky. dGUI makes **data control and errors handling easier**, leaving you free to process your data and logic at different scales : initialization (conditional fields), formPannel submission, MDI section submission... 
* You can **easily lay out the content** according to which parameters are important in your UI. For instance, you might want to adjust the fields's size only depending on the container's width, or maybe have three fields of same size horizontaly layered (all you have to do is putting them in an array, as described in a further example thereafter).
## <a name="2"></a> 2. Code examples
### Common dialog boxes
```javascript
dgui.alert("Hello world, from dgui !");

dgui.confirm("Would you like to use that stuff ?", "Confirm", (ans) => {
  if(ans.value) { dgui.alert("Thank you !"); }
});

dgui.prompt("May I ask you to indicate your name ?", "Entry", (ans) => {
  dgui.alert("Hello " + ans.value);
});

```
![alt "common dialog boxes"](examples/commonDialogsBoxes.png)

### Easy coloring
```javascript
dgui.modalForm({
  title: "My modal form !",
  MDI: {
    sections: [
      {key: "profile", label: "Profile", fields: [
        {key: "firstname", label: "Firstname"},
        {key: "name", label: "Name"},
        {key: "hobby", label: "Hobby"},
        [{type: "quantity", key: "quantity", size: 1},
        {key: "pet", size: 2}]
      ]},
      {key: "kitchen", label: "Kitchen"},
      {key: "setup", label: "Setup"}
    ],
    options: {containerWidth: 450, containerHeight: 400}
    //You can set just one color and dGUI will do the rest !
  }, options: {color: "#f7f5ef"}
}, (form) => {
  form.end();
});
```
![alt "colored modals"](examples/coloredModals.png)
### Modal and MDI
```javascript
dgui.modalForm({
  title: "My modal form !",
  MDI: {
    sections: [
      {key: "profile", label: "Profile", fields: [
        /* if not specified, default field type is "text" */
        {key: "firstname", label: "Firstname"},
        {key: "name", label: "Name"},
        {key: "hobby", label: "Hobby"},
        /* By embedding fields in arrays, you can layer them horizontally*/
        [{type: "quantity", key: "quantity", size: 1},
        /* label attribut is optional */
        /* size attribut sets field's width proportionnaly (ratio 2/3) */
        {key: "pet", size: 2}]
      ]},
      {key: "kitchen", label: "Kitchen"},
      {key: "setup", label: "Setup"}
    ],
    options: {menuLayout: "horizontal", containerWidth: 450, containerHeight: 400}
  }
}, (form) => {
  let data = form.value;
  /* You can access data using key attribut values */
  console.log(data);
  if(data.profile.firstname == "Donald") {
    dgui.alert("Yuck !");
    /* Close the modal */
    form.end();
  }
});
```
![alt "modal form"](examples/modalForm.png)

### Contextmenus
```javascript
html_element.addEventListener("contextmenu", (e) => {
  e.preventDefault();   /* disable the default contextmenu */
  dgui.contextMenu(e, {
    fields: [
      {key: "important", label: "important !", type: "switch", switchLock: true, action: (target_elm, bool) => {
        /* Instructions */
      }},
      {key: "task", label: "Task", contextMenu: {
        fields: [         
          /* You can conditionally display menu items */
          {label: "New task", condition: false, action: (target_elm) => { t.task(target_elm, "add", note.title) }},
          {label: "status", contextMenu: {
            fields: [
              {key: "initial", label: "initial", group: "task", action: (key) => { /* Instructions */ }},
              {key: "ongoing", label: "ongoing", group: "task", action: (key) => { /* Instructions */ }},
              {key: "achieved", label: "achieved", group: "task", action: (key) => { /* Instructions */ }}
            ]
          }},
          {label: "modify", action: (target_elm) => { t.task(target_elm, "edit", null, note.task) }},
          {label: "remove", action: (target_elm) => { 
            dgui.confirm("Are you sure you want to remove this task ?", "Remove task", (res) => {
              if(res) { Some_Function_To_Delete(target_elm.dataset.id); }
            });
           }}
        ]}
      },
      {label: "copy", contextMenu: {
        fields: [
          {label: "content", action: (target_elm) => {
            let target_id =  target_elm.dataset.id;
            let target = document.getElementById(target_id);
            /* dGUI provides some usefull functions */
            dgui.copyToClipboard(target.innerHTML);
          }}
        ]}
      }
    ], options: {initPosition: "mouse"}
  }, (feedback) => {
    /* You can also get the data from here, especially if your menu contains switches */
  });
});
```
![alt "contextmenus"](examples/contextMenu.png)
## <a name="3"></a> 3. API documentation
### <a name="3_1"></a> 3.1 Fields
* At the moment, a field can be of the following types : **message**, **button**, **text**, **quantity**, **choice**, **switch**, **select**, **date**.
* If type attribut is not specified, text is set by default.

#### Common attributs to describe fields
* **key** (string) : refers the field to access it during submission step
* **label** (string) : text displayed on or above the field input
* **initValue** (string, boolean, number) : the value to be displayed at init
* **size** (number) : specifies the field's width
* **condition** (boolean | {key: string, value: any}) : if true (external variable or function) or equals value of field associated (key), displays the field at init.

#### Select field specific attribut
* **list** (Array<string>) : The options of a HTML select element. By default, the value of the field is set to the index in the list array.

#### Date field specific attribut
* **format** (string) : specifies the date format for the field generation. For instance it can takes "YYYY.MM.DD", "dd.mm.yyyy" or "DD:MM:YY"... At submission, date field will return  a **ISO-8601** formatted string.

### <a name="3_2"></a> 3.2 Contextual menus
* A contextmenu can be triggered from **right click** or can be used as a **dropdown menu** by triggering it from a normal click event.
* It is provided by function **contextMenu(event, description, callback)**.
* Class ContextMenu can be described by providing an object containing **two attributs** : an array of **fields** and **initPosition** which can be **"bottom"** | **"right"** | **"left"** | **"mouse"**
* It provides 3 types of fields : **button**, **switch** and **context**.
* type attribut is not mandatory for context and button types. Indeed, by default type is set to button and context field has a context attribut.

#### Common attributs to describe fields
* **key** (string) : refers the field to access it during submission step
* **label** (string) : text displayed on the field
* **condition** (boolean) : if true (external variable or function), displays the field at init.

#### Switch field specific attributs
* **initValue** (boolean)
* **action** (Function) : triggered by a click on the field
* **switchLock** (boolean) : specifies if a click on a switch keeps the contextmenu opened or not
* **group** (string) : if two or more switches belong to the same group, the last one to be switched on causes the others to be switched off

#### Button field specific attribut
* **action** (Function) : triggered by a click on the field

#### Context field specific attribut
* **contextMenu** (contextMenu_description_obj)

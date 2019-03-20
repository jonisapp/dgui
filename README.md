# dGUI - Interface elements generator library including data and events handling

[link Use cases](#1)
[link Code examples](#2)

## <a name="1"></a> Use cases
* Meteor applications (dGUI was developped in this context)
* Webapps
* Cloud computing platforms
## To whom is it addressed ?
* Developpers who want to focus on data and logic rather than graphics
* People who believe in "one task at a time design" philosphy
## Features
* View is entirely self-generated
* Clean and simple syntax
* A lot of code economy
* integrate well in any kind of environment
* form elements
* MDI elements
* modals
* contextual menus
* (soon) selection tool
* (soon) theming
## <a name="2"></a> Code examples
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
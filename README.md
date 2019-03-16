# dGUI - Interface elements generator including data and events handling

## Use cases
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
## Code examples
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
![alt "test"](examples/commonDialogsBoxes.png)
customDialogueBox
===============

Custom-made asynchronous dialogue boxes for **modern browsers**.
Basically, this is a replacement for the browser's built-in dialogue boxes (alert, confirm, and prompt).

## Notes

This requires the jQuery library and the classList shim.

## customDialogueBox.alert

### Syntax

`customDialogueBox.alert(message, title, callback);`

<<<<<<< HEAD
    * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
    * **title** is an optional string of text that will serve as the dialogue box's title.
    * **callback** is an optional callback function that runs upon clicking of the **Ok** button.
=======
   * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the *Ok* button.
>>>>>>> origin/master

### Example Usage

```javascript
customDialogueBox.alert('This is an alert dialogue box', 'Alert');
```

## customDialogueBox.confirm

### Syntax

`customDialogueBox.confirm(message, title, callback);`

<<<<<<< HEAD
    * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
    * **title** is an optional string of text that will serve as the dialogue box's title.
    * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single boolean argument will be passed in the function.
=======
   * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the *Ok* button. A single boolean argument will be passed in the function.
>>>>>>> origin/master

### Example Usage

```javascript
customDialogueBox.confirm('This is a confirm dialogue box', 'Confirm', function (value) {
    if (value) {
        console.log('You clicked "Yes".');
    } else {
        console.log('You clicked "No".');
    }
});
```

## customDialogueBox.prompt

### Syntax

`customDialogueBox.confirm(message, default_value, title, callback);`

<<<<<<< HEAD
    * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
    * **default_value** is an optional value that will serve as the input box's default value.
    * **title** is an optional string of text that will serve as the dialogue box's title.
    * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single argument (which will either be the text entered in the input box, or the value *null*) will be passed in the function.
=======
   * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
   * **default_value** is an optional value that will serve as the input box's default value.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the *Ok* button. A single argument (which will either be the text entered in the input box, or the value *null*) will be passed in the function.
>>>>>>> origin/master

### Example Usage

```javascript
customDialogueBox.prompt('This is a prompt dialogue box', 'Prompt', function (value) {
    if (value !== null) {
        alert('Hello ' + value);
    } else {
        console.log('You clicked "Cancel".');
    }
});
```

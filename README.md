customDialogueBox
===============

Custom-made, pseudo-synchronous dialogue boxes for **modern browsers**.
Basically, this is a replacement for the browser's built-in dialogue boxes (**alert**, **confirm**, and **prompt**).

Since these dialogue boxes are really asynchronous in nature (it can't return a value directly nor freeze the program execution unlike the browser's dialogue boxes), callbacks are utilized.

## Notes

This requires the **jQuery** library and the **classList** shim.

## customDialogueBox.alert()

### Syntax

`customDialogueBox.alert(message, title).then(callback);`

   * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button.

### Example Usage

```javascript
customDialogueBox.alert('This is an alert dialogue box', 'Alert');
```

```javascript
customDialogueBox.alert('This is an alert dialogue box with no title, but has an optional callback').then(function () {
    console.log('Alert callback');
});
```

## customDialogueBox.confirm()

### Syntax

`customDialogueBox.confirm(message, title).then(callback);`

   * **message** is an optional string of text that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single boolean argument will be passed in the function.

### Example Usage

```javascript
customDialogueBox.confirm('This is a confirm dialogue box', 'Confirm').then(function (value) {
    if (value) {
        console.log('You clicked "Yes".');
    } else {
        console.log('You clicked "No".');
    }
});
```

```javascript
customDialogueBox.confirm('This is a confirm dialogue box with no title.').then(function (value) {
    if (value) {
        console.log('You clicked "Yes".');
    } else {
        console.log('You clicked "No".');
    }
});
```

## customDialogueBox.prompt()

### Syntax

`customDialogueBox.confirm(message, default_value, title).then(callback);`

   * **message** is an optional string of text that you want to display in the dialogue box's body.
   * **default_value** is an optional value that will serve as the input box's default value.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single argument (which will either be the text entered in the input box, or the value **null**) will be passed in the function.

### Example Usage

```javascript
customDialogueBox.prompt('This is a prompt dialogue box with no title, but has a default value "nerd"', 'nerd').then(function (value) {
    if (value !== null) {
        alert('Hello ' + value);
    } else {
        console.log('You clicked "Cancel".');
    }
});
```

```javascript
customDialogueBox.prompt('This is a prompt dialogue box with no default value, but has a title.', '', 'Prompt').then(function (value) {
    if (value !== null) {
        alert('Hello ' + value);
    } else {
        console.log('You clicked "Cancel".');
    }
});
```
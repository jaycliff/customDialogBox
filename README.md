custom_dialogue_box
===============

Custom-made, pseudo-synchronous dialogue boxes for **modern browsers**.
Basically, this is a replacement for the browser's built-in dialogue boxes (**alert**, **confirm**, and **prompt**).

Since these dialogue boxes are really asynchronous in nature (it can neither return a value directly nor freeze the program execution (which the browser's dialogue boxes does)), callbacks are utilized.

## Notes

This requires the **jQuery** library.

## Alert Dialogue Box

### Syntax

`$.custom_dialogue_box.alert(message, title).then(callback);`

   * **message** is an optional string of text (or alternatively, an object that is always converted into a string) that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button.

### Example Usage

```javascript
$.custom_dialogue_box.alert('This is an alert dialogue box with a custom title "Alert".', 'Alert');
```

```javascript
$.custom_dialogue_box.alert('This is an alert dialogue box with the default title "JavaScript Alert", and an optional callback').then(function () {
    console.log('Alert callback');
});
```

## Confirm Dialogue Box

### Syntax

`$.custom_dialogue_box.confirm(message, title).then(callback);`

   * **message** is an optional string of text that you want to display in the dialogue box's body.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single boolean argument will be passed in the function.

### Example Usage

```javascript
$.custom_dialogue_box.confirm('This is a confirm dialogue box with a custom title "Confirm".', 'Confirm').then(function (value) {
    if (value) {
        console.log('You clicked "Yes".');
    } else {
        console.log('You clicked "No".');
    }
});
```

```javascript
$.custom_dialogue_box.confirm('This is a confirm dialogue box with the default title "JavaScript Confirm".').then(function (value) {
    if (value) {
        console.log('You clicked "Yes".');
    } else {
        console.log('You clicked "No".');
    }
});
```

## Prompt Dialogue Box

### Syntax

`$.custom_dialogue_box.prompt(message, default_value, title).then(callback);`

   * **message** is an optional string of text that you want to display in the dialogue box's body.
   * **default_value** is an optional value that will serve as the input box's default value.
   * **title** is an optional string of text that will serve as the dialogue box's title.
   * **callback** is an optional callback function that runs upon clicking of the **Ok** button. A single argument (which will either be the text entered in the input box, or the value **null**) will be passed in the function.

### Example Usage

```javascript
$.custom_dialogue_box.prompt('This is a prompt dialogue box with the default title "JavaScript Prompt", and a default value "nerd".', 'nerd').then(function (value) {
    if (value !== null) {
        alert('Hello ' + value);
    } else {
        console.log('You clicked "Cancel".');
    }
});
```

```javascript
$.custom_dialogue_box.prompt('This is a prompt dialogue box with no default value, but has a custom title "Prompt".', '', 'Prompt').then(function (value) {
    if (value !== null) {
        alert('Hello ' + value);
    } else {
        console.log('You clicked "Cancel".');
    }
});
```

## Settings

### Syntax

`$.custom_dialogue_box.setOption(name_of_option, value)`

   * **name_of_option** is the, uh, name of the option that you want to change.
   * **value** is the appropriate, uh, value for **name_of_option**.
   
### Example Usage

```javascript
// Set the fade-in / fade-out speed to 1000 milliseconds.
$.custom_dialogue_box.setOption('fade_speed', 1000);

// Set the default title to an empty string (The default is "JavaScript <type of dialogue box>").
$.custom_dialogue_box.setOption('default_title', '');
```

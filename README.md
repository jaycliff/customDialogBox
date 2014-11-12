customDialogueBox
===============

Custom-made asynchronous dialogue boxes for **modern browsers**.
Basically, this is a (somewhat non-blocking) replacement for the browser's built-in dialogue boxes (alert, confirm, and prompt).

## customDialogueBox.alert

`customDialogueBox.alert('This is an alert dialogue box', 'Alert');`

## customDialogueBox.confirm

`customDialogueBox.confirm('This is a confirm dialogue box', 'Confirm', function (value) {
    // Outputs the boolean 'true';
    console.log(value);
}, function (value) {
    // Outputs the boolean 'false';
    console.log(value);
});`

## customDialogueBox.prompt

`customDialogueBox.alert('This is a prompt dialogue box', 'Prompt', function (value) {
    // Outputs whatever you wrote on the prompt's input textbox;
    console.log(value);
}, function (value) {
    // Outputs the primitive 'null'
    console.log(value);
});`
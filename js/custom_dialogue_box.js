/*
    Copyright 2014 Jaycliff Arcilla of Eversun Software Philippines Corporation (Davao Branch)
    
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
        http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/*jslint browser: true, devel: true, nomen: false, unparam: true, sub: false, bitwise: false, forin: false */
/*global $, jQuery*/
(function (global, $) {
    "use strict";
    var $document = $(document), $window = $(global);
    function eventFire(element, event_type) {
        var event_object;
        if (typeof element[event_type] === "function") {
            element[event_type]();
            return true;
        }
        if (element.fireEvent) {
            return element.fireEvent('on' + event_type);
        }
        event_object = document.createEvent('Events');
        event_object.initEvent(event_type, true, false);
        return element.dispatchEvent(event_object);
    }
    $document.ready(function () {
        var customDialogueBox;
        (function setupDialogMarkup() {
            var overlay = document.createElement('div'),
                cdb = document.createElement('div'),
                close = document.createElement('div'),
                close_span = document.createElement('span'),
                content = document.createElement('div'),
                title = document.createElement('div'),
                message = document.createElement('div'),
                prompt_wrap = document.createElement('div'),
                prompt_input = document.createElement('input'),
                button_tray = document.createElement('div'),
                ok = document.createElement('button'),
                cancel = document.createElement('button');
            prompt_input.disabled = true;
            ok.disabled = true;
            cancel.disabled = true;
            overlay.setAttribute('id', 'custom-dialogue-box-overlay');
            overlay.setAttribute('tabindex', '1');
            overlay.setAttribute('style', 'display: none;');
            cdb.setAttribute('id', 'custom-dialogue-box');
            close.className = 'close';
            close_span.className = 'close-icon';
            content.className = 'content';
            title.className = 'title';
            message.className = 'message';
            prompt_wrap.className = 'prompt-wrap';
            prompt_input.className = 'prompt-input';
            button_tray.className = 'button-tray';
            prompt_input.setAttribute('name', 'prompt-input');
            prompt_input.setAttribute('placeholder', 'Enter a value');
            prompt_input.setAttribute('value', '');
            ok.setAttribute('type', 'button');
            cancel.setAttribute('type', 'button');
            ok.textContent = 'Ok';
            cancel.textContent = 'Cancel';
            button_tray.appendChild(ok);
            button_tray.appendChild(cancel);
            close.appendChild(close_span);
            cdb.appendChild(close);
            content.appendChild(title);
            content.appendChild(message);
            prompt_wrap.appendChild(prompt_input);
            content.appendChild(prompt_wrap);
            cdb.appendChild(content);
            cdb.appendChild(button_tray);
            overlay.appendChild(cdb);
            document.body.appendChild(overlay);
            customDialogueBox = (function () {
                var active = false,
                    callback_priority = false,
                    last_focused_element,
                    entry_object_pool,
                    entry_type = '',
                    fade_speed = 80,
                    okCallback,
                    cancelCallback,
                    list_of_entries = [],
                    // list_of_prioritized_entries is for the instances made inside the callbacks
                    list_of_prioritized_entries = [],
                    $overlay = $(overlay),
                    $cdb = $(cdb),
                    $close = $(close),
                    $title = $(title),
                    $message = $(message),
                    $prompt_wrap = $(prompt_wrap),
                    $prompt_input = $(prompt_input),
                    $ok = $(ok),
                    $cancel = $(cancel),
                    button_active_class = 'on',
                    positionDialog = function () {
                        $cdb.css('left', (Math.floor($document.outerWidth() / 2) - Math.floor($cdb.outerWidth() / 2)) + 'px');
                        $cdb.css('margin-top', (-Math.floor($cdb.outerHeight() / 2)) + 'px');
                    },
                    displayEntry = function () {
                        var entry = list_of_entries.shift();
                        entry_type = entry.type;
                        // Note: the $(element).text(value) method of jQuery won't change the actual textContent of the element if the value being passed is undefined
                        switch (entry_type) {
                        case 'alert':
                            $prompt_wrap.hide();
                            $ok.text('Ok');
                            $cancel.hide();
                            $ok.trigger('focus');
                            break;
                        case 'confirm':
                            $prompt_wrap.hide();
                            $ok.text('Yes');
                            $cancel.text('No').show();
                            okCallback = entry.okCallback;
                            cancelCallback = entry.cancelCallback;
                            $ok.trigger('focus');
                            break;
                        case 'prompt':
                            $prompt_wrap.show();
                            $ok.text('Ok');
                            $cancel.text('Cancel').show();
                            okCallback = entry.okCallback;
                            cancelCallback = entry.cancelCallback;
                            $prompt_input.trigger('focus');
                            break;
                        }
                        $message.text(entry.message);
                        $title.text(entry.title);
                        positionDialog();
                        entry_object_pool.banish(entry);
                    },
                    resetDB = function () {
                        cdb.className = '';
                        entry_type = '';
                        $message.text('');
                        $title.text('');
                        $prompt_input.val('');
                    },
                    clickHandler,
                    confirmation = function () {
                        if (list_of_entries.length > 0) {
                            resetDB();
                            displayEntry();
                        } else {
                            active = false;
                            prompt_input.disabled = true;
                            ok.disabled = true;
                            cancel.disabled = true;
                            $window.off('resize', positionDialog);
                            $cdb.off('mousedown click', 'button, input', $cdb.data('event-allow-focus'));
                            $prompt_input.off('keypress', $prompt_input.data('event-allow-typing'));
                            $overlay.off('keydown', $overlay.data('event-controlled-keydown')).off('mousedown click keypress', $overlay.data('event-prevent-leak'));
                            $ok.off('click', clickHandler);
                            $cancel.off('click', clickHandler);
                            $close.off('click', clickHandler);
                            eventFire(last_focused_element, 'focus');
                            $overlay.stop().fadeOut(fade_speed, resetDB);
                        }
                    };
                clickHandler = function (event) {
                    if (entry_type !== 'alert') {
                        callback_priority = true;
                        switch (entry_type) {
                        case 'confirm':
                            if ($.data(this, 'yes')) {
                                if (typeof okCallback === "function") {
                                    okCallback(true);
                                }
                            } else {
                                if (typeof cancelCallback === 'function') {
                                    cancelCallback(false);
                                }
                            }
                            break;
                        case 'prompt':
                            if ($.data(this, 'yes')) {
                                if (typeof okCallback === "function") {
                                    okCallback($prompt_input.val());
                                }
                            } else {
                                if (typeof cancelCallback === 'function') {
                                    cancelCallback(null);
                                }
                            }
                            break;
                        }
                        callback_priority = false;
                        while (list_of_prioritized_entries.length > 0) {
                            list_of_entries.unshift(list_of_prioritized_entries.pop());
                        }
                    }
                    confirmation();
                };
                (function () {
                    var sb_active = false, keyupHandler = function (event) {
                        var active_element = document.activeElement;
                        event.stopImmediatePropagation();
                        if (event.which === 32) {
                            if (active_element !== prompt_input) {
                                $.data(active_element, '$this').trigger('click');
                                active_element.classList.remove(button_active_class);
                            }
                            sb_active = false;
                            $overlay.off('keyup', keyupHandler);
                        }
                    };
                    $overlay.data('event-controlled-keydown', function (event) {
                        event.stopImmediatePropagation();
                        switch (event.which) {
                        // The default behaviour of the keys below must be overridden
                        // TAB
                        case 9:
                            event.preventDefault();
                            if (entry_type === 'alert') {
                                if (document.activeElement !== ok) {
                                    $ok.trigger('focus');
                                }
                            } else {
                                switch (entry_type) {
                                case 'confirm':
                                    if (sb_active) {
                                        document.activeElement.classList.remove(button_active_class);
                                    }
                                    if (document.activeElement === ok) {
                                        $cancel.trigger('focus');
                                        if (sb_active) {
                                            cancel.classList.add(button_active_class);
                                        }
                                    } else {
                                        $ok.trigger('focus');
                                        if (sb_active) {
                                            ok.classList.add(button_active_class);
                                        }
                                    }
                                    break;
                                case 'prompt':
                                    if (sb_active && document.activeElement !== prompt_input) {
                                        document.activeElement.classList.remove(button_active_class);
                                    }
                                    switch (document.activeElement) {
                                    case prompt_input:
                                        $ok.trigger('focus');
                                        if (sb_active) {
                                            ok.classList.add(button_active_class);
                                        }
                                        break;
                                    case ok:
                                        $cancel.trigger('focus');
                                        if (sb_active) {
                                            cancel.classList.add(button_active_class);
                                        }
                                        break;
                                    case cancel:
                                        $prompt_input.trigger('focus');
                                        break;
                                    default:
                                        $prompt_input.trigger('focus');
                                    }
                                    break;
                                }
                            }
                            break;
                        // ENTER
                        case 13:
                            if (document.activeElement === ok || document.activeElement === cancel) {
                                event.preventDefault();
                                $.data(document.activeElement, '$this').trigger('click');
                            } else {
                                if (document.activeElement === prompt_input) {
                                    event.preventDefault();
                                    $ok.trigger('focus');
                                    //$ok.trigger('click');
                                }
                            }
                            break;
                        case 27:
                            event.preventDefault();
                            $close.trigger('click');
                            break;
                        // SPACEBAR
                        case 32:
                            if (!sb_active && (document.activeElement === ok || document.activeElement === cancel)) {
                                event.preventDefault();
                                sb_active = true;
                                document.activeElement.classList.add(button_active_class);
                                $overlay.on('keyup', keyupHandler);
                            }
                            break;
                        default:
                            if (document.activeElement !== prompt_input && event.which !== 122) {
                                event.preventDefault();
                            }
                        }
                    });
                }());
                $cdb.data('event-allow-focus', function (event) {
                    // Let's allow the elements to be focused during these events, bypassing the 'event leak' prevention in $overlay below.
                    event.stopImmediatePropagation();
                });
                $prompt_input.data('event-allow-typing', function (event) {
                    // Let's allow this element to be 'typable' (yes, textboxes requires both the keydown and keypress' default event to be not prevented), bypassing the 'event leak' prevention in $overlay below.
                    event.stopImmediatePropagation();
                });
                $overlay.data('event-prevent-leak', function (event) {
                    // Let's prevent the 'leakage' of the events farther up the DOM tree.
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    //$overlay.focus();
                });
                $prompt_input.data('$self', $prompt_input);
                $ok.data('$this', $ok);
                $cancel.data('$this', $cancel);
                entry_object_pool = (function () {
                    var pool = [];
                    function createObject() {
                        if (typeof Object.create === "function") {
                            return Object.create(null);
                        }
                        return {};
                    }
                    return {
                        'summon': function () {
                            if (pool.length > 0) {
                                return pool.pop();
                            }
                            return createObject();
                        },
                        'banish': function (entry) {
                            var key;
                            for (key in entry) {
                                if (Object.prototype.hasOwnProperty.call(entry, key)) {
                                    delete entry[key];
                                }
                            }
                            pool.push(entry);
                        }
                    };
                }());
                $.data(ok, 'yes', true);
                $.data(cancel, 'yes', false);
                $.data(close, 'yes', false);
                function stringify(value, force_actual) {
                    var string;
                    switch (value) {
                    case null:
                        string = 'null';
                        break;
                    case undefined:
                        string = force_actual ? 'undefined' : '';
                        break;
                    default:
                        string = (typeof value === "string") ? value : value.toString();
                    }
                    return string;
                }
                function dialogueBoxCommonality(type, a, b, c, d) {
                    var entry = entry_object_pool.summon();
                    entry.type = type;
                    switch (type) {
                    case 'alert':
                        entry.message = stringify(a);
                        entry.title = stringify(b);
                        break;
                    default:
                        switch (typeof a) {
                        case 'object':
                            entry.message = stringify(a.message);
                            entry.title = stringify(a.title);
                            entry.okCallback = a.yes || a.ok || a.okCallback || a.yesCallback;
                            entry.cancelCallback = a.no || a.cancel || a.cancelCallback || a.noCallback;
                            break;
                        case 'function':
                            entry.message = '';
                            entry.title = '';
                            entry.okCallback = a;
                            entry.cancelCallback = b;
                            break;
                        default:
                            entry.message = stringify(a);
                            if (typeof b === "function") {
                                entry.title = '';
                                entry.okCallback = b;
                                entry.cancelCallback = c;
                            } else {
                                entry.title = stringify(b);
                                entry.okCallback = c;
                                entry.cancelCallback = d;
                            }
                        }
                    }
                    if (callback_priority) {
                        list_of_prioritized_entries.push(entry);
                    } else {
                        list_of_entries.push(entry);
                    }
                    if (!active) {
                        active = true;
                        last_focused_element = document.activeElement;
                        $window.on('resize', positionDialog);
                        $cdb.on('mousedown click', 'button, input', $cdb.data('event-allow-focus'));
                        $prompt_input.on('keypress', $prompt_input.data('event-allow-typing'));
                        $overlay.on('keydown', $overlay.data('event-controlled-keydown')).on('mousedown click keypress', $overlay.data('event-prevent-leak'));
                        prompt_input.disabled = false;
                        ok.disabled = false;
                        cancel.disabled = false;
                        $ok.on('click', clickHandler);
                        $cancel.on('click', clickHandler);
                        $close.on('click', clickHandler);
                        $overlay.stop().fadeIn(fade_speed);
                        displayEntry();
                    }
                }
                return {
                    confirm: function (a, b, c, d) {
                        cdb.className = 'confirm';
                        dialogueBoxCommonality('confirm', a, b, c, d);
                    },
                    prompt: function (a, b, c, d) {
                        cdb.className = 'prompt';
                        dialogueBoxCommonality('prompt', a, b, c, d);
                    },
                    alert: function (a, b) {
                        cdb.className = 'alert';
                        // Start emulation on how the native 'alert' handles the undefined value
                        if (a === undefined) {
                            a = stringify(a, (arguments.length > 0));
                        }
                        if (b === undefined) {
                            b = stringify(b, (arguments.length > 1));
                        }
                        // End emulation on how the native 'alert' handles the undefined value
                        dialogueBoxCommonality('alert', a, b);
                    },
                    setOption: function (option_name, value) {
                        switch (option_name.toLowerCase()) {
                        case 'fadespeed':
                            fade_speed = value;
                            break;
                        default:
                            customDialogueBox.alert('Invalid option name "' + option_name + '"', 'Set Option');
                        }
                    }
                };
            }());
        }());
        if (typeof Object.defineProperty === "function") {
            Object.defineProperty(global, 'customDialogueBox', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: customDialogueBox
            });
        } else {
            global.customDialogueBox = customDialogueBox;
        }
    });
}(window, jQuery));
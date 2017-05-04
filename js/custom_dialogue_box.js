/*
    Copyright 2017 Jaycliff Arcilla of Eversun Software Philippines Corporation (Davao Branch)
    
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
/*jslint browser: true, devel: true, nomen: false, unparam: false, sub: false, bitwise: false, forin: false */
/*global jQuery*/
if (typeof String.prototype.trim !== "function") {
    (function (rtrim) {
        "use strict";
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
        // Make sure we trim BOM and NBSP
    }(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g));
}
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
        var custom_dialogue_box, id = 'custom-dialogue-box', has_class_list = !!document.documentElement.classList, hasOwnProperty = Object.prototype.hasOwnProperty;
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
            overlay.setAttribute('id', id + '-overlay');
            overlay.setAttribute('tabindex', '1');
            overlay.setAttribute('style', 'display: none;');
            cdb.setAttribute('id', id);
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
            custom_dialogue_box = (function () {
                var active = false,
                    safe_mode = false, // only used for confirm dialogue box
                    callback_priority = false,
                    last_focused_element,
                    entry_object_pool,
                    entry_type = '',
                    fade_speed = 80,
                    default_title = 'JavaScript ',
                    is_original_default_title = true,
                    callback,
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
                    list_of_touched_clickables = {},
                    overlayTouchUpHandler = function (event) {
                        var $active_element = $.data(list_of_touched_clickables[event.which], '$self');
                        if ($active_element) {
                            $active_element.removeClass('on');
                        }
                        $overlay.off('custom:touchup', overlayTouchUpHandler);
                    },
                    $click_catchers = $cdb.find('button, input, div.close'),
                    $the_buttons = $ok.add($cancel),
                    button_active_class = 'on',
                    createDialogueBoxEntry,
                    positionDialog = function () {
                        // We're using 'left' instead of 'margin-left' to properly align the cdb in small window widths, since the cdb doesn't have a fixed width (however, it does have a min-width)
                        $cdb.css('left', (Math.floor($overlay.outerWidth() / 2) - Math.floor($cdb.outerWidth() / 2)) + 'px');
                        $cdb.css('margin-top', (-Math.floor($cdb.outerHeight() / 2)) + 'px');
                    },
                    displayEntry = function () {
                        var entry = list_of_entries.shift();
                        entry_type = entry.type;
                        callback = entry.callback;
                        if (has_class_list) {
                            cdb.classList.add(entry_type);
                        } else {
                            $cdb.addClass(entry_type);
                        }
                        if (cdb.id !== id) {
                            cdb.setAttribute('id', id);
                        }
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
                            if (safe_mode) {
                                $cancel.trigger('focus');
                            } else {
                                $ok.trigger('focus');
                            }
                            break;
                        case 'prompt':
                            $prompt_wrap.show();
                            $ok.text('Ok');
                            $cancel.text('Cancel').show();
                            $prompt_input.val(entry.default_value);
                            $prompt_input.trigger('focus');
                            if (entry.default_value) {
                                $prompt_input.trigger('select');
                            }
                            break;
                        }
                        $message.text(entry.message);
                        $title.text(entry.title);
                        positionDialog();
                        entry_object_pool.banish(entry);
                    },
                    resetDialogueBox = function () {
                        if (has_class_list) {
                            cdb.classList.remove(entry_type);
                        } else {
                            $cdb.removeClass(entry_type);
                        }
                        //$cdb.css('left', 'auto').css('margin-top', 0);
                        $cdb.removeAttr('style');
                        callback = undefined;
                        entry_type = '';
                        $message.text('');
                        $title.text('');
                        $prompt_input.val('');
                    },
                    clickHandler,
                    confirmation = function () {
                        if (list_of_entries.length > 0) {
                            resetDialogueBox();
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
                            $ok.off('click custom:tap', clickHandler);
                            $cancel.off('click custom:tap', clickHandler);
                            $close.off('click custom:tap', clickHandler);
                            eventFire(last_focused_element, 'focus');
                            $overlay.stop().fadeOut(fade_speed, resetDialogueBox);
                        }
                    };
                $click_catchers.on('custom:touchdown', function (event) {
                    list_of_touched_clickables[event.which] = this;
                    $overlay.on('custom:touchup', overlayTouchUpHandler);
                    $.data(this, '$self').addClass('on').trigger('focus');
                });
                $prompt_input.on('mousedown touchstart', function () {
                    if (has_class_list) {
                        document.activeElement.classList.remove(button_active_class);
                    } else {
                        $.data(document.activeElement, '$this').removeClass(button_active_class);
                    }
                });
                $ok.data('$self', $ok);
                $cancel.data('$self', $cancel);
                $close.data('$self', $close);
                (function () {
                    var sb_active = false, keyupHandler = function (event) {
                        var active_element = document.activeElement, $active_element;
                        event.preventDefault(); // Prevents click simulation in Firefox.
                        event.stopImmediatePropagation();
                        // SPACEBAR
                        if (event.which === 32) {
                            if (active_element !== prompt_input) { // If the active element is either ok or cancel...
                                $active_element = $.data(active_element, '$this');
                                $active_element.trigger('click');
                                if (has_class_list) {
                                    active_element.classList.remove(button_active_class);
                                } else {
                                    $active_element.removeClass(button_active_class);
                                }
                            }
                            sb_active = false;
                            $overlay.off('keyup', keyupHandler);
                        }
                    };
                    $window.on('blur', function () {
                        var active_element = document.activeElement, $active_element;
                        if (sb_active) {
                            sb_active = false;
                            if (active_element && (active_element !== prompt)) {
                                $active_element = $.data(active_element, '$this');
                                if (has_class_list) {
                                    active_element.classList.remove(button_active_class);
                                } else {
                                    $active_element.removeClass(button_active_class);
                                }
                                $active_element.trigger('blur');
                            }
                            $overlay.off('keyup', keyupHandler);
                        }
                    });
                    clickHandler = function () {
                        callback_priority = true;
                        if (sb_active) {
                            sb_active = false;
                            $overlay.off('keyup', keyupHandler);
                        }
                        switch (entry_type) {
                        case 'confirm':
                            if (typeof callback === "function") {
                                if ($.data(this, 'yes')) {
                                    callback(true);
                                } else {
                                    callback(false);
                                }
                            }
                            break;
                        case 'prompt':
                            if (typeof callback === "function") {
                                if ($.data(this, 'yes')) {
                                    callback($prompt_input.val());
                                } else {
                                    callback(null);
                                }
                            }
                            break;
                        default:
                            // This is for alert
                            if (typeof callback === "function") {
                                callback();
                            }
                        }
                        callback_priority = false;
                        while (list_of_prioritized_entries.length > 0) {
                            list_of_entries.unshift(list_of_prioritized_entries.pop());
                        }
                        confirmation();
                    };
                    $the_buttons.on('focus', function () {
                        var other;
                        if (document.activeElement === ok) {
                            other = cancel;
                        } else {
                            other = ok;
                        }
                        if (has_class_list) {
                            if (sb_active) {
                                this.classList.add(button_active_class);
                            }
                            other.classList.remove(button_active_class);
                        } else {
                            if (sb_active) {
                                $.data(this, '$this').addClass(button_active_class);
                            }
                            $.data(other, '$this').removeClass(button_active_class);
                        }
                    });
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
                                        if (has_class_list) {
                                            document.activeElement.classList.remove(button_active_class);
                                        } else {
                                            $.data(document.activeElement, '$this').removeClass(button_active_class);
                                        }
                                    }
                                    if (document.activeElement === ok) {
                                        $cancel.trigger('focus');
                                        if (sb_active) {
                                            if (has_class_list) {
                                                cancel.classList.add(button_active_class);
                                            } else {
                                                $cancel.addClass(button_active_class);
                                            }
                                        }
                                    } else {
                                        $ok.trigger('focus');
                                        if (sb_active) {
                                            if (has_class_list) {
                                                ok.classList.add(button_active_class);
                                            } else {
                                                $ok.addClass(button_active_class);
                                            }
                                        }
                                    }
                                    break;
                                case 'prompt':
                                    if (sb_active && document.activeElement !== prompt_input) {
                                        if (has_class_list) {
                                            document.activeElement.classList.remove(button_active_class);
                                        } else {
                                            $.data(document.activeElement, '$this').removeClass(button_active_class);
                                        }
                                    }
                                    switch (document.activeElement) {
                                    case prompt_input:
                                        $ok.trigger('focus');
                                        if (sb_active) {
                                            if (has_class_list) {
                                                ok.classList.add(button_active_class);
                                            } else {
                                                $ok.addClass(button_active_class);
                                            }
                                        }
                                        break;
                                    case ok:
                                        $cancel.trigger('focus');
                                        if (sb_active) {
                                            if (has_class_list) {
                                                cancel.classList.add(button_active_class);
                                            } else {
                                                $cancel.addClass(button_active_class);
                                            }
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
                                    //$ok.trigger('focus');
                                    $ok.trigger('click');
                                }
                            }
                            break;
                        case 27:
                            event.preventDefault();
                            $close.trigger('click');
                            break;
                        // SPACEBAR
                        case 32:
                            event.preventDefault();
                            if (!sb_active && (document.activeElement === ok || document.activeElement === cancel)) {
                                sb_active = true;
                                if (has_class_list) {
                                    document.activeElement.classList.add(button_active_class);
                                } else {
                                    $.data(document.activeElement, '$this').addClass(button_active_class);
                                }
                                $overlay.on('keyup', keyupHandler);
                            }
                            break;
                        default:
                            // Prevent all keyboard keys' default behavious, except when the prompt's input box is active, or the F11 key is pressed.
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
                $overlay.data('$this', $overlay);
                $prompt_input.data('$this', $prompt_input);
                $ok.data('$this', $ok);
                $cancel.data('$this', $cancel);
                $close.data('$this', $close);
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
                                if (hasOwnProperty.call(entry, key)) {
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
                        string = force_actual ? "undefined" : '';
                        break;
                    default:
                        string = (typeof value === "string") ? value : value.toString();
                    }
                    return string;
                }
                (function () {
                    var entry,
                        thenner = function (callback) { entry.callback = callback; },
                        then_carrier = {
                            "after": thenner,
                            "andDo": thenner,
                            "andThen": thenner,
                            "andSo": thenner,
                            "call": thenner,
                            "callback": thenner,
                            "do": thenner,
                            "evaluate": thenner,
                            "next": thenner,
                            "process": thenner,
                            "so": thenner,
                            "then": thenner,
                            "thenCall": thenner,
                            "thenDo": thenner
                        },
                        forNextCycle = function () {
                            $overlay.stop().fadeIn(fade_speed);
                            displayEntry();
                        };
                    if (Object.freeze) {
                        Object.freeze(then_carrier);
                    }
                    function capitaliseFirstLetter(string) {
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }
                    createDialogueBoxEntry = function (type, a, b, c) {
                        entry = entry_object_pool.summon();
                        entry.type = type;
                        entry.message = stringify(a);
                        switch (type) {
                        case 'prompt':
                            entry.default_value = stringify(b);
                            entry.title = (c === undefined) ? (is_original_default_title ? default_title + capitaliseFirstLetter(type) : default_title) : stringify(c);
                            break;
                        default:
                            entry.title = (b === undefined) ? (is_original_default_title ? default_title + capitaliseFirstLetter(type) : default_title) : stringify(b);
                            // c as safe mode parameter (The "No" button is focused by default)
                            if (type === 'confirm' && !!c) {
                                entry.safe = true;
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
                            // Just in case...
                            if (has_class_list) {
                                $ok[0].classList.remove(button_active_class);
                                $cancel[0].classList.remove(button_active_class);
                            } else {
                                $ok.removeClass(button_active_class);
                                $cancel.removeClass(button_active_class);
                            }
                            $close.on('click', clickHandler);
                            setTimeout(forNextCycle, 0);
                        }
                        return then_carrier;
                    };
                }());
                return {
                    alert: function (a, b) {
                        // Start emulation on how the native 'alert' handles the undefined value
                        if (a === undefined) {
                            a = stringify(a, (arguments.length > 0));
                        }
                        // End emulation on how the native 'alert' handles the undefined value
                        return createDialogueBoxEntry('alert', a, b);
                    },
                    confirm: function (a, b) {
                        return createDialogueBoxEntry('confirm', a, b);
                    },
                    prompt: function (a, b, c) {
                        return createDialogueBoxEntry('prompt', a, b, c);
                    },
                    setOption: function (option_name, value) {
                        switch (option_name.toLowerCase()) {
                        case 'fade_speed':
                            fade_speed = Number(value);
                            break;
                        case 'default_title':
                            default_title = String(value);
                            if (is_original_default_title) {
                                is_original_default_title = false;
                            }
                            break;
                        case 'restore_defaults':
                            if (!!value) {
                                fade_speed = 80;
                                default_title = 'JavaScript ';
                                is_original_default_title = true;
                                safe_mode = false;
                            }
                            break;
                        case 'safe_mode':
                            safe_mode = !!value;
                            break;
                        default:
                            custom_dialogue_box.alert('Invalid option name "' + option_name + '"', 'Set Option Error');
                        }
                        return this;
                    }
                };
            }());
            // Start random easter egg
            (function () {
                var key, toStringer = function (key) {
                    return function () {
                        return 'function ' + key + '() { [imagi-native code] }';
                    };
                };
                for (key in custom_dialogue_box) {
                    if (hasOwnProperty.call(custom_dialogue_box, key)) {
                        custom_dialogue_box[key].toString = toStringer(key);
                    }
                }
                key = null;
            }());
            // End random easter egg
        }());
        if (typeof Object.defineProperty === "function") {
            Object.defineProperty(global, 'custom_dialogue_box', {
                enumerable: true,
                configurable: false,
                writable: false,
                value: custom_dialogue_box
            });
            Object.defineProperty($, 'custom_dialogue_box', {
                enumerable: true,
                configurable: false,
                writable: false,
                value: custom_dialogue_box
            });
        } else {
            global.custom_dialogue_box = custom_dialogue_box;
            $.custom_dialogue_box = custom_dialogue_box;
        }
    });
}(window, typeof jQuery === "function" && jQuery));
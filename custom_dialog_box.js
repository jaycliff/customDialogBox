/*jslint browser: true, devel: true, nomen: false, unparam: true, sub: false, bitwise: false, forin: false */
/*global $, jQuery, hasClass, addClass, removeClass*/
(function (global, $) {
    "use strict";
    var $document = $(document), $window = $(global), garbage = [];
    $document.ready(function () {
        var customConfirmationDialog;
        (function setupDialogMarkup() {
            var overlay = document.createElement('div'),
                ccd = document.createElement('div'),
                close = document.createElement('div'),
                close_span = document.createElement('span'),
                title = document.createElement('div'),
                message = document.createElement('div'),
                button_tray = document.createElement('div'),
                ok = document.createElement('button'),
                cancel = document.createElement('button');
            overlay.setAttribute('id', 'ccd-overlay');
            overlay.setAttribute('style', 'display: none;');
            addClass(ccd, 'ccd');
            addClass(ccd, 'ccd-confirm-box');
            addClass(close, 'ccd-close');
            addClass(close_span, 'glyphicon');
            addClass(close_span, 'glyphicon-remove');
            addClass(title, 'ccd-title');
            addClass(message, 'ccd-message');
            addClass(button_tray, 'ccd-button-tray');
            ok.setAttribute('type', 'button');
            cancel.setAttribute('type', 'button');
            ok.textContent = 'Yes';
            cancel.textContent = 'No';
            button_tray.appendChild(ok);
            button_tray.appendChild(cancel);
            close.appendChild(close_span);
            ccd.appendChild(close);
            ccd.appendChild(title);
            ccd.appendChild(message);
            ccd.appendChild(button_tray);
            overlay.appendChild(ccd);
            document.body.appendChild(overlay);
            garbage.push(setupDialogMarkup);
        }());
        customConfirmationDialog = (function () {
            var active = false,
                callback_priority = false,
                fade_speed = 80,
                default_message = '',
                default_title = '',
                entry_object_pool,
                list_of_entries = [],
                // list_of_prioritized_entries is for the instances made inside the callbacks
                list_of_prioritized_entries = [],
                $ccd = $('div.ccd'),
                $overlay = $('#ccd-overlay'),
                $close = $ccd.find('div.ccd-close'),
                $title = $ccd.find('div.ccd-title'),
                $message = $ccd.find('div.ccd-message'),
                $ok = $ccd.find('div.ccd-button-tray > button:first-child'),
                $cancel = $ccd.find('div.ccd-button-tray > button:last-child'),
                yesCallback,
                noCallback,
                buttonTab = function buttonTab(event) {
                    //event.stopPropagation();
                    event.preventDefault();
                    //console.log('tab switching is active');
                    if (document.activeElement === $ok[0]) {
                        $cancel.trigger('focus');
                    } else {
                        $ok.trigger('focus');
                    }
                },
                positionDialog = function () {
                    $ccd.css('left', (Math.floor($document.outerWidth() / 2) - Math.floor($ccd.outerWidth() / 2)) + 'px');
                    $ccd.css('margin-top', '-' + Math.floor($ccd.outerHeight() / 2) + 'px');
                },
                displayEntry = function () {
                    var entry = list_of_entries.shift();
                    $message.text(entry.message);
                    $title.text(entry.title);
                    yesCallback = entry.yesCallback;
                    noCallback = entry.noCallback;
                    $ok.trigger('focus');
                    positionDialog();
                    entry_object_pool.banish(entry);
                },
                confirmation = function () {
                    if (list_of_entries.length > 0) {
                        displayEntry();
                    } else {
                        active = false;
                        $window.off('resize', positionDialog);
                        $document.off('keydown', buttonTab);
                        $overlay.stop().fadeOut(fade_speed);
                    }
                },
                clickHandler = function () {
                    callback_priority = true;
                    if ($.data(this, 'yes')) {
                        if (typeof yesCallback === "function") {
                            yesCallback();
                        }
                    } else {
                        if (typeof noCallback === 'function') {
                            noCallback();
                        }
                    }
                    callback_priority = false;
                    while (list_of_prioritized_entries.length > 0) {
                        list_of_entries.unshift(list_of_prioritized_entries.pop());
                    }
                    confirmation();
                };
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
                        if (pool.length > 1) {
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
            $.data($ok[0], 'yes', true);
            $.data($cancel[0], 'yes', false);
            $.data($close[0], 'yes', false);
            $ok.on('click', clickHandler);
            $cancel.on('click', clickHandler);
            $close.on('click', clickHandler);
            return function (a, b, c, d) {
                var entry = entry_object_pool.summon();
                if (a === null && a === undefined) {
                    a = default_message;
                } else {
                    if (typeof a === "number" || typeof a === "boolean") {
                        a = a.toString();
                    }
                }
                switch (typeof a) {
                case 'object':
                    entry.message = a.message || default_message;
                    entry.title = a.title || default_title;
                    entry.yesCallback = a.yesCallback;
                    entry.noCallback = a.noCallback;
                    break;
                case 'string':
                    entry.message = a;
                    if (typeof b === "function") {
                        entry.title = default_title;
                        entry.yesCallback = b;
                        entry.noCallback = c;
                    } else {
                        switch (typeof b) {
                        case 'string':
                            entry.title = b;
                            break;
                        case 'number':
                            entry.title = b.toString();
                            break;
                        default:
                            entry.title = default_title;
                        }
                        entry.yesCallback = c;
                        entry.noCallback = d;
                    }
                    break;
                case 'function':
                    entry.message = default_message;
                    entry.title = default_title;
                    entry.yesCallback = a;
                    entry.noCallback = b;
                    break;
                }
                if (callback_priority) {
                    list_of_prioritized_entries.push(entry);
                } else {
                    list_of_entries.push(entry);
                }
                if (!active) {
                    active = true;
                    $window.on('resize', positionDialog);
                    $document.on('keydown', buttonTab);
                    $overlay.stop().fadeIn(fade_speed);
                    displayEntry();
                }
            };
        }());
        if (typeof Object.defineProperty === "function") {
            Object.defineProperty(global, 'customConfirmationDialog', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: customConfirmationDialog
            });
        } else {
            global.customConfirmationDialog = customConfirmationDialog;
        }
    });
}(window, jQuery));

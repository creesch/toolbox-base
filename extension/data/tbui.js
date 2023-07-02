import browser from 'webextension-polyfill';
import $ from 'jquery';
import tinycolor from 'tinycolor2';

import TBLog from './tblog.js';
import * as TBStorage from './tbstorage.js';
import * as TBHelpers from './tbhelpers.js';
import * as TBCore from './tbcore.js';

import {icons} from './tbconstants';
export {icons};

const logger = TBLog('TBui');
const $body = $('body');

export const longLoadArray = [];
export const longLoadArrayNonPersistent = [];

// We don't want brack-buttons to propagate to parent elements as that often triggers the reddit lightbox
$body.on('click', '.tb-bracket-button', event => {
    event.stopPropagation();
});

let subredditColorSalt;
let contextMenuLocation = 'left';
let contextMenuAttention = 'open';
let contextMenuClick = false;

(async () => {
    subredditColorSalt = await TBStorage.getSettingAsync('QueueTools', 'subredditColorSalt', 'PJSalt');
    contextMenuLocation = await TBStorage.getSettingAsync('GenSettings', 'contextMenuLocation', 'left');
    contextMenuAttention = await TBStorage.getSettingAsync('GenSettings', 'contextMenuAttention', 'open');
    contextMenuClick = await TBStorage.getSettingAsync('GenSettings', 'contextMenuClick', false);
})();

// Icons NOTE: string line length is ALWAYS 152 chars

export const logo64 = `iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsRAAALEQF/ZF+R
                    AAAAGHRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4wLjVlhTJlAAAD1ElEQVR4Xu1ZS0hUURg+WY0tNFy0qCiCGpoaC8fXqBEZPWfRsgdRtCgkKBfRIqpFmZugAisLd9YiQsw2thGtsDYVQURBSRQ9FxER
                    FaRm5vT9+h853DmT3uE4Vzzng++e4/863/nvY+44wsFh6qG8vHx9aWnpLfBVSUnJG4xPi4uLz8A+l0MmF8rKyjZA5FmI3QLOY7NvoM5i1LkPJnVE7V/gCYTmjGRMEkDUdUXoX/zdg/EaxhqctRjmMzk0
                    LYqKigoR94VrjMWbSJk2khkwotFoCIK+ewR6+Q28jYbUg5sxn8Ppw4hEIvmwveNYyVbEbqd48BBITVX9pzg9WEDYJikK817wqyJSS8QMgs8xb8a9vRvjZcXfRzW5/CgSiUQufFdkHGL+4JZZyO7gACFN
                    iqimcDici7ECfx8G2zH/LP3jZC2X1iEH9ahxMraO7YEhByI+SUE4mwm2q5gO0SvBGsS0YHwr472E7yedac7TAnH7lPhONgcDCKhUxPwYS7wEGhVG/C7kNWN8rdR4zCFpgbi4Et/N5mAAAaelGLCFzb6A
                    vNWyBur1sDktELdRib/H5mAAAS+lGDyQdrDZF3A1zJc1wCFwGbu0QHyDjMf6bWzOPmKxWFQKAfvj8fhsdvkGNvJQ2VQXTNoXHTR5BWJ+y1hwD7uyDwg9rgjpYHNGQDO3KrWoCZ3gEnYT6GFLMaMvSvB/
                    oE8c9mcfEPBIisFluZ/NGQP1bsh6vEF6V3iC+R3wo+oDh+Bbx6nZBy73BSRCiqH7mF0Zo7q6ehZqtXPNtMTG+zDu5LRgABEHFFEP2GwEqFeL+u+V+pLU8A56DnBocICQLkXYUTYbA66GGdjoKnAvmnEQ
                    a2zDVbaI3cEC39oKIGpANgDClrPLDmDz9AYnz/4LNtuDpVVVbYWVlckoGKmoCPzLiDgvxN2LQnRni/V5eQP1+flJ4rlQ6FmjJiZbpL0LTPrBpKXsdw2gg8doE10DXAPo4DHaxIwacPWCEHU6ks8TOxE0
                    ub7/BlwSYg2/QqSAfLockzS8/nADemkyXuLFZS2vlwLy6XJM0vD6vaJViJAfnvzP72rk0+WYpOn1OdVi0H3TgEvHBws4NQXk88ROBI2tP/w8wdNzEPeC7gGhJeJTfneTIJ8uxyRNrk979/0pQJ3j9VJA
                    Pl2OSRpe3//HoPUNMPw57JuG13dvgpk0YCrRNcA1gA4eo010DXANoIPHaBNdA1wD6OAx2kTXANcAOniMNtE1wDWADh6jTXQNcA2gg8doE10DfP8wMpVIe6cr4EijEMdsJO2d/6Pu4GAnhPgH06SDEG5p
                    qnUAAAAASUVORK5CYII=`;

export const iconBot = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACz0lEQVQ4T3VTXUhTYRh+zzbdNHZ0E5sjdLOiLnTahQaCFGiIwSK9iIGhGQjOM3GgN0MENYTJYGKiG91kPxe5qxkJk0jQ7EKwvHAarMTM
                    tvYD+2XqnHPr/Q4Jm60PDt95v/f7nvM8z/ccCs4NrVY7I5FIng4ODn5Lb+n1ernX69VNTk6q09ep8wAjIyOcvb09o0wm04+OjvpIX6PR3OJyuU1isfgJ9uP/BZiYmLgUDAYtqVTqSjKZFOKhMM5crGl8
                    D+LBHyKRSNXf3+86A8lgYDAYOuRy+UuFQgFutwdKS0tBIBDAzs4OFBTQ7Ly7u/tIp9O9ygowPm7oKSoSmQKBAJSVlYHP5wOhkMa9KQiFQsDhcCAWizEIYM4KYDQaew4PD01VVVXQ2HgHTKYZODqKQW+v
                    BhwOB9hsNigsLGQGBgayA0xNTfXQNG3yeDzA4/EA9UJ+/gXY3/8J6APKKICTkxOmr6/vXwCz2VzpcrneV1YqpHV1dSxloVDIMo1Go4DAsLa2Bltbdjf61NTV1bVFeqyJeLfX/X7/SnPzXcnq6kc4PT0F
                    dD3jhgmDRCIBDQ2NsLho80ql0tsMwzio6enpa0h5Wam8JyXuz829gerqG2iijNBlqefk5MDBQRTm563Q3a0Gu90OCwvv3Bi4GmpoaGgVDauvra2B7e2vpAEtLS1QXn6ZBSCD+BEOh2F29jkolUqoqKiA
                    9fXPsLT04RM1PDzsV6lU4ng8DlarNcLn82kMDxwfH2dIwHUgD/qRaG1t5eXm5oLFYglQY2Nj9filtxRFEe3a4uLi1+3tHZBMpmBlZRmczl+QXm9sfHmGjB78lXafNRHzLUCXKdR6FRubbW0PWQBiqMvl
                    hPTa7f7NINsXkUgkhediGVHGf0HB5fI2Ozs70TwgGpGBE9JrBMyeA8IEg8TH69zPy8u7SGqMbQgZxdPrkhLZTbX68fczg/4A1KNbXBApXrkAAAAASUVORK5CYII=`;

/** Map of commonly used color names to CSS color values. */
export const standardColors = {
    red: '#FF0000',
    softred: '#ED4337',
    green: '#347235',
    lightgreen: '#00F51E',
    blue: '#0082FF',
    magenta: '#DC00C8',
    cyan: '#00F0F0',
    yellow: '#EAC117',
    softyellow: '#FFFC7F',
    black: '#000000',
};

export const FEEDBACK_NEUTRAL = 'neutral';
export const FEEDBACK_POSITIVE = 'positive';
export const FEEDBACK_NEGATIVE = 'negative';

export const DISPLAY_CENTER = 'center';
export const DISPLAY_BOTTOM = 'bottom';
export const DISPLAY_CURSOR = 'cursor';

/**
 * Generates HTML for a general button.
 * @param {string} text Raw HTML string rendered inside the button
 * @param {string} classes Extra text added to the button's `class` attribute
 * @returns {string}
 */
export const button = (text, classes) => `
    <a href="javascript:;" class="tb-general-button ${classes}">${text}</a>
`;

/**
 * Generates HTML for an action button.
 * @param {string} text Raw HTML string rendered inside the button
 * @param {string} classes Extra text added to the button's `class` attribute
 * @returns {string}
 */
export const actionButton = (text, classes) => `
    <a href="javascript:;" class="tb-action-button ${classes}">${text}</a>
`;

// Notification stuff

/**
 * Show an in-page notification on the current tab.
 * @function
 * @param {object} options The options for the notification
 * @param {string} options.id The notification's ID
 * @param {string} options.title The notification's title
 * @param {string} options.body The notification's body
 */
export const showNotification = ({id, title, body}) => {
    let $notificationDiv = $('#tb-notifications-wrapper');
    if (!$notificationDiv.length) {
        // Create the wrapper element if it's not already there
        $notificationDiv = $(`
                <div id="tb-notifications-wrapper"></div>
            `).appendTo($body);
    }

    // Make lines of the message into paragraphs
    body = body
        .split('\n')
        .filter(line => line) // Ignore empty lines
        .map(line => `<p>${TBHelpers.escapeHTML(line)}</p>`)
        .join('');

    $notificationDiv.prepend(`
            <div class="tb-window tb-notification" data-id="${id}">
                <div class="tb-window-header">
                    <div class="tb-window-title">${title}</div>
                    <div class="buttons">
                        <a class="close">
                            <i class="tb-icons">${icons.close}</i>
                        </a>
                    </div>
                </div>
                <div class="tb-window-content">${body}</div>
            </div>
        `);
};

/**
 * Clears an in-page notification on the current tab.
 * @function
 * @param {string} id The ID of the notification to clear
 */
export const clearNotification = id => {
    $(`.tb-notification[data-id="${id}"]`).remove();
};

// Handle notification updates from the background page
browser.runtime.onMessage.addListener(message => {
    if (message.action === 'tb-show-page-notification') {
        logger.log('Notifier message get:', message);
        showNotification(message.details);
    } else if (message.action === 'tb-clear-page-notification') {
        logger.log('Notifier message clear:', message);
        clearNotification(message.id);
    }
});

// Notification click handlers
$body.on('click', '.tb-notification .close', function (event) {
    event.stopPropagation(); // don't open the linked page
    browser.runtime.sendMessage({
        action: 'tb-page-notification-clear',
        id: $(this).closest('.tb-notification').attr('data-id'),
    });
});
$body.on('click', '.tb-notification', function () {
    browser.runtime.sendMessage({
        action: 'tb-page-notification-click',
        id: $(this).attr('data-id'),
    });
});

/**
 * Generate a popup.
 * @function
 * @param {object} options Options for the popup
 * @param {string} options.title The popup's title (raw HTML)
 * @param {object[]} options.tabs The tabs for the popup
 * @param {string} [options.footer] The popup footer (used for all tabs; if
 * provided, tab footers are ignored)
 * @param {string} [options.cssClass] Extra CSS class to add to the popup
 * @param {string} [options.meta] Raw HTML to add to a "meta" container
 * @param {boolean} [options.draggable=true] Whether the user can move the
 * popup
 * @param {string} [options.defaultTabID] If provided, the tab with this ID
 * will be displayed initially; otherwise, the first tab will be shown
 * @returns {jQuery}
 */
export function popup ({
    title,
    tabs,
    footer,
    cssClass = '',
    meta,
    draggable = true,
    closable = true,
    defaultTabID,
}) {
    // tabs = [{id:"", title:"", tooltip:"", help_text:"", help_url:"", content:"", footer:""}];
    const $popup = $(`
            <div class="tb-window ${draggable ? 'tb-window-draggable' : ''} ${cssClass}">
                ${meta ? `<div class="meta" style="display: none;">${meta}</div>` : ''}
                <div class="tb-window-header">
                    <div class="tb-window-title">${title}</div>
                    <div class="buttons">
                        <a class="close" href="javascript:;">
                            <i class="tb-icons">${icons.close}</i>
                        </a>
                    </div>
                </div>
            </div>
        `);
    if (tabs.length === 1) {
        // We don't use template literals here as the content can be a jquery object.
        $popup.append($('<div class="tb-window-content"></div>').append(tabs[0].content));
        $popup.append($('<div class="tb-window-footer"></div>').append(footer || tabs[0].footer));
    } else {
        const $tabs = $('<div class="tb-window-tabs"></div>');
        $popup.append($tabs);

        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];
            if (tab.id === 'undefined' || !tab.id) {
                tab.id = tab.title.trim().toLowerCase().replace(/\s/g, '_');
            }

            // Check whether this is the tab that will be shown first. If
            // defaultTabID is given, compare that to this tab's ID; otherwise,
            // just check if this is the first tab.
            const isDefaultTab = defaultTabID == null ? i === 0 : tab.id === defaultTabID;

            // Create tab button
            const $button = $(`
                    <a class="${tab.id}" title="${tab.tooltip || ''}">
                        ${tab.title}
                    </a>
                `);

            $button.click({tab}, function (e) {
                const tab = e.data.tab;

                // hide others
                $tabs.find('a').removeClass('active');
                $popup.find('.tb-window-tab').hide();

                // show current
                $popup.find(`.tb-window-tab.${tab.id}`).show();
                $(this).addClass('active');

                e.preventDefault();
            });

            // Activate the default tab
            if (isDefaultTab) {
                $button.addClass('active');
            }

            $button.appendTo($tabs);

            // We don't use template literals here as the content can be a jquery object.
            const $tab = $(`<div class="tb-window-tab ${tab.id}"></div>`);
            $tab.append($('<div class="tb-window-content"></div>').append(tab.content));
            if (!footer) {
                // Only display tab footer if whole-popup footer not set
                $tab.append($('<div class="tb-window-footer""></div>').append(tab.footer));
            }

            // Only show the default tab
            if (isDefaultTab) {
                $tab.show();
            } else {
                $tab.hide();
            }

            $tab.appendTo($popup);
        }

        // If we have a whole-popup footer, add it underneath the tabbed portion
        if (footer) {
            $popup.append($('<div class="tb-window-footer"></div>').append(footer));
        }
    }

    if (draggable) {
        $popup.drag($popup.find('.tb-window-header'));
        // Don't let people drag by the buttons, that gets confusing
        $popup.find('.buttons a').on('mousedown', e => e.stopPropagation());
    }

    if (closable) {
        $popup.on('click', '.close', event => {
            event.stopPropagation();
            $popup.remove();
        });
    }

    return $popup;
}

export function drawPosition (event) {
    const positions = {
        leftPosition: '',
        topPosition: '',
    };

    const $overlay = $(event.target).closest('.tb-page-overlay');

    if (document.documentElement.clientWidth - event.pageX < 400) {
        positions.leftPosition = event.pageX - 600;
    } else {
        positions.leftPosition = event.pageX - 50;
    }

    if (document.documentElement.clientHeight - event.pageY < 200 && location.host === 'mod.reddit.com') {
        const topPosition = event.pageY - 600;

        if (topPosition < 0) {
            positions.topPosition = 5;
        } else {
            positions.topPosition = event.pageY - 600;
        }
    } else {
        positions.topPosition = event.pageY - 50;
    }

    if ($overlay.length) {
        const scrollTop = $overlay.scrollTop();
        positions.topPosition = event.clientY + scrollTop;
    }

    if (positions.topPosition < 0) {
        positions.topPosition = 5;
    }

    return positions;
}

export function switchOverlayTab (overlayClass, tabName) {
    const $overlay = $body.find(`.${overlayClass}`);

    const $tab = $overlay.find(`[data-module="${tabName}"]`);

    $overlay.find('.tb-window-tabs a').removeClass('active');
    $tab.addClass('active');

    $('.tb-window .tb-window-tab').hide();
    $(`.tb-window .tb-window-tab.${tabName}`).show();
}

/**
 * Generates an overlay containing a single large window.
 * @param {string} title The title of the window
 * @param {object[]} tabs An array of tab objects
 * @param {string} buttons Additional buttons to add to the window's header
 * as an HTML string
 * @param {string} css_class Additional CSS classes to add to the overlay
 * @param {string} single_footer If provided, a single footer to use for all
 * tabs rather than relying on the footer data from each provided tab object
 * @param {object} details An object of metadata attached to the overlay,
 * where each key:val of the object is mapped to a `data-key="val"` attribute
 * @param {bool} verticalTabs Pass false to use horizontal tabs instead
 */
export function overlay (title, tabs, buttons, css_class, single_footer, details, verticalTabs = true) {
    buttons = typeof buttons !== 'undefined' ? buttons : '';
    css_class = typeof css_class !== 'undefined' ? css_class : '';
    single_footer = typeof single_footer !== 'undefined' ? single_footer : false;

    // tabs = [{id:"", title:"", tooltip:"", help_page:"", content:"", footer:""}];
    const $overlay = $(`
            <div class="tb-page-overlay ${css_class ? ` ${css_class}` : ''}">
                <div class="tb-window tb-window-large ${verticalTabs ? 'tb-window-vertical-tabs' : ''}">
                    <div class="tb-window-header">
                        <div class="tb-window-title">${title}</div>
                        <div class="buttons">
                            ${buttons}
                            <a class="close" href="javascript:;">
                                <i class="tb-icons">${icons.close}</i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `);

    if (details) {
        Object.entries(details).forEach(([key, value]) => {
            $overlay.attr(`data-${key}`, value);
        });
    }

    // we need a way to handle closing the overlay with a default, but also with use-specific cleanup code to run
    // NOTE: Click handler binds should be attached to the parent element of the relevant object, not $(body).
    // $overlay.on('click', '.buttons .close', function () {});
    if (tabs.length === 1) {
        $overlay.find('.tb-window').append($('<div class="tb-window-content"></div>').append(tabs[0].content));
        $overlay.find('.tb-window').append($('<div class="tb-window-footer"></div>').append(single_footer ? single_footer : tabs[0].footer));
    } else if (tabs.length > 1) {
        $overlay.find('.tb-window').append($('<div class="tb-window-tabs"></div>'));
        $overlay.find('.tb-window').append($('<div class="tb-window-tabs-wrapper"></div>'));

        for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i];

            tab.disabled = typeof tab.disabled === 'boolean' ? tab.disabled : false;
            tab.help_page = typeof tab.help_page !== 'undefined' ? tab.help_page : '';

            if (!TBStorage.getSetting('Utils', 'advancedMode', false) && tab.advanced) {
                continue;
            }

            if (tab.id === 'undefined' || !tab.id) {
                tab.id = tab.title.trim().toLowerCase();
                tab.id = tab.id.replace(/\s/g, '_');
            }

            const $button = $(`<a${tab.tooltip ? ` title="${tab.tooltip}"` : ''} ${tab.id ? ` data-module="${tab.id}"` : ''} class="${tab.id}" >${tab.title} </a>`);

            $button.data('help_page', tab.help_page);

            if (tab.disabled) {
                $button.addClass('tb-module-disabled');
                $button.attr('title', 'This module is not active, you can activate it in the "Toggle Modules" tab.');
            }

            // click handler for tabs
            $button.click({tab}, function (e) {
                const tab = e.data.tab;

                // hide others
                $overlay.find('.tb-window-tabs a').removeClass('active');
                $overlay.find('.tb-window-tab').hide();

                // show current
                $overlay.find(`.tb-window-tab.${tab.id}`).show();

                // Only hide and show the footer if we have multiple options for it.
                if (!single_footer) {
                    $overlay.find('.tb-window-footer').hide();
                    $overlay.find(`.tb-window-footer.${tab.id}`).show();
                }

                $(this).addClass('active');

                e.preventDefault();
            });

            $button.appendTo($overlay.find('.tb-window-tabs'));

            const $tab = $(`<div class="tb-window-tab ${tab.id}"></div>`);
            // $tab.append($('<div class="tb-window-content">' + tab.content + '</div>'));
            $tab.append($('<div class="tb-window-content"></div>').append(tab.content));
            // individual tab footers (as used in .tb-config)
            if (!single_footer) {
                $overlay.find('.tb-window').append($(`<div class="tb-window-footer ${tab.id}"></div>`).append(tab.footer));

                const $footer = $overlay.find(`.tb-window-footer.${tab.id}`);
                if (i === 0) {
                    $footer.show();
                } else {
                    $footer.hide();
                }
            }

            // default first tab is active = visible; hide others
            if (i === 0) {
                $button.addClass('active');

                $tab.show();
            } else {
                $tab.hide();
            }

            $tab.appendTo($overlay.find('.tb-window .tb-window-tabs-wrapper'));
        }
    }

    // single footer for all tabs (as used in .tb-settings)
    if (single_footer) {
        $overlay.find('.tb-window').append($('<div class="tb-window-footer"></div>').append(single_footer));
    }

    return $overlay;
}

export function selectSingular (choices, selected) {
    const $selector = $(`
        <div class="select-single">
            <select class="selector tb-action-button"></select>
        </div>`),
          $selector_list = $selector.find('.selector');

    // Add values to select
    choices.forEach(keyValue => {
        const value = keyValue.toLowerCase().replace(/\s/g, '_');
        $selector_list.append($('<option>').attr('value', value).text(keyValue));
    });

    // Set selected value
    $selector_list.val(selected).prop('selected', true);

    return $selector;
}

export function selectMultiple (available, selected) {
    available = available instanceof Array ? available : [];
    selected = selected instanceof Array ? selected : [];

    const $select_multiple = $(`
                  <div class="select-multiple">
                      <select class="selected-list left tb-action-button"></select>&nbsp;<button class="remove-item right tb-action-button">remove</button>&nbsp;
                      <select class="available-list left tb-action-button"></select>&nbsp;<button class="add-item right tb-action-button">add</button>&nbsp;
                      <div style="clear:both"></div>
                  </div>
              `),
          $selected_list = $select_multiple.find('.selected-list'),
          $available_list = $select_multiple.find('.available-list');

    $select_multiple.on('click', '.remove-item', e => {
        const $select_multiple = $(e.delegateTarget);
        $select_multiple.find('.selected-list option:selected').remove();
    });

    $select_multiple.on('click', '.add-item', e => {
        const $select_multiple = $(e.delegateTarget);
        const $add_item = $select_multiple.find('.available-list option:selected');

        // Don't add the sub twice.
        let exists = false;
        $selected_list.find('option').each(function () {
            if (this.value === $add_item.val()) {
                exists = true;
                return false;
            }
        });

        if (!exists) {
            $selected_list.append($add_item.clone()).val($add_item.val());
        }
    });

    available.forEach(value => {
        $available_list.append($('<option>').attr('value', value).text(value));
    });

    selected.forEach(value => {
        $selected_list.append($('<option>').attr('value', value).text(value));
    });

    return $select_multiple;
}

export function mapInput (labels, items) {
    const keyLabel = labels[0],
          valueLabel = labels[1];

    const $mapInput = $(`<div>
            <table class="tb-map-input-table">
                <thead><tr>
                    <td>${keyLabel}</td>
                    <td>${valueLabel}</td>
                    <td class="tb-map-input-td-remove">remove</td>
                </tr></thead>
                <tbody></tbody>
            </table>
            <a class="tb-map-input-add tb-icons tb-icons-positive" href="javascript:void(0)">${icons.addBox}</a></div>`);

    const emptyRow = `
            <tr class="tb-map-input-tr">
                <td><input type="text" class="tb-input" name="key"></td>
                <td><input type="text" class="tb-input" name="value"></td>
                <td class="tb-map-input-td-remove">
                    <a class="tb-map-input-td-remove" href="javascript:void(0)"></a>
                </td>
            </tr>`;

    // remove item
    $mapInput.on('click', '.tb-map-input-remove', function () {
        $(this).closest('.tb-map-input-tr').remove();
    });

    // add empty item
    $mapInput.on('click', '.tb-map-input-add', () => {
        $(emptyRow).appendTo($mapInput.find('.tb-map-input-table tbody'));
    });

    // populate items
    if ($.isEmptyObject(items)) {
        $(emptyRow).appendTo($mapInput.find('.tb-map-input-table tbody'));
    } else {
        Object.entries(items).forEach(([key, value]) => {
            const $item = $(`
                <tr class="tb-map-input-tr">
                    <td><input type="text" class="tb-input" value="${TBHelpers.htmlEncode(unescape(key))}" name="key"></td>
                    <td><input type="text" class="tb-input" value="${TBHelpers.htmlEncode(unescape(value))}" name="value"></td>
                    <td class="tb-map-input-td-remove">
                        <a class="tb-map-input-remove tb-icons tb-icons-negative tb-icons-align-middle" href="javascript:void(0)">${icons.delete}</a>
                    </td>
                </tr>`);
            $item.appendTo($mapInput.find('.tb-map-input-table tbody'));
        });
    }

    return $mapInput;
}

export function textFeedback (feedbackText, feedbackKind, displayDuration, displayLocation) {
    if (!displayLocation) {
        displayLocation = DISPLAY_CENTER;
    }

    // Without text we can't give feedback, the feedbackKind is required to avoid problems in the future.
    if (feedbackText && feedbackKind) {
        // If there is still a previous feedback element on the page we remove it.
        $body.find('#tb-feedback-window').remove();

        // build up the html, not that the class used is directly passed from the function allowing for easy addition of other kinds.
        const feedbackElement = TBStorage.purify(`<div id="tb-feedback-window" class="${feedbackKind}"><span class="tb-feedback-text">${feedbackText}</span></div>`);

        // Add the element to the page.
        $body.append(feedbackElement);

        // center it nicely, yes this needs to be done like this if you want to make sure it is in the middle of the page where the user is currently looking.
        const $feedbackWindow = $body.find('#tb-feedback-window');

        switch (displayLocation) {
        case DISPLAY_CENTER: {
            const feedbackLeftMargin = $feedbackWindow.outerWidth() / 2,
                  feedbackTopMargin = $feedbackWindow.outerHeight() / 2;

            $feedbackWindow.css({
                'margin-left': `-${feedbackLeftMargin}px`,
                'margin-top': `-${feedbackTopMargin}px`,
            });
        }
            break;
        case DISPLAY_BOTTOM: {
            $feedbackWindow.css({
                left: '5px',
                bottom: '40px',
                top: 'auto',
                position: 'fixed',
            });
        }
            break;
        case DISPLAY_CURSOR: {
            $(document).mousemove(e => {
                const posX = e.pageX,
                      posY = e.pageY;

                $feedbackWindow.css({
                    left: posX - $feedbackWindow.width() + 155,
                    top: posY - $feedbackWindow.height() - 15,
                    position: 'fixed',
                });
            });
        }
            break;
        }

        // And fade out nicely after 3 seconds.
        $feedbackWindow.delay(displayDuration ? displayDuration : 3000).fadeOut();
    }
}

// Our awesome long load spinner that ended up not being a spinner at all. It will attend the user to ongoing background operations with a warning when leaving the page.
export function longLoadSpinner (createOrDestroy, feedbackText, feedbackKind, feedbackDuration, displayLocation) {
    if (createOrDestroy !== undefined) {
        // if requested and the element is not present yet
        if (createOrDestroy && longLoadArray.length === 0) {
            $('head').append(`<style id="tb-long-load-style">
                .mod-toolbox-rd #tb-bottombar, .mod-toolbox-rd #tb-bottombar-hidden {
                    bottom: 10px !important
                }
                </style>`);

            $body.append(`<div id="tb-loading-stuff"><span class="tb-loading-content"><img src="${browser.runtime.getURL('data/images/snoo_running.gif')}" alt="loading"> <span class="tb-loading-text">${TBCore.RandomFeedback}</span></span></div>`);
            $body.append('<div id="tb-loading"></div>');

            const $randomFeedbackWindow = $body.find('#tb-loading-stuff'),
                  randomFeedbackLeftMargin = $randomFeedbackWindow.outerWidth() / 2,
                  randomFeedbackTopMargin = $randomFeedbackWindow.outerHeight() / 2;

            $randomFeedbackWindow.css({
                'margin-left': `-${randomFeedbackLeftMargin}px`,
                'margin-top': `-${randomFeedbackTopMargin}px`,
            });

            longLoadArray.push('load');

            // if requested and the element is already present
        } else if (createOrDestroy && longLoadArray.length > 0) {
            longLoadArray.push('load');

            // if done and the only instance
        } else if (!createOrDestroy && longLoadArray.length === 1) {
            $('head').find('#tb-long-load-style').remove();
            $body.find('#tb-loading').remove();
            $body.find('#tb-loading-stuff').remove();
            longLoadArray.pop();

            // if done but other process still running
        } else if (!createOrDestroy && longLoadArray.length > 1) {
            longLoadArray.pop();
        }

        // Support for text feedback removing the need to fire two function calls from a module.
        if (feedbackText !== undefined && feedbackKind !== undefined) {
            textFeedback(feedbackText, feedbackKind, feedbackDuration, displayLocation);
        }
    }
}

// Our awesome long load spinner that ended up not being a spinner at all. It will attend the user to ongoing background operations, this variant will NOT warn when you leave the page.
export function longLoadNonPersistent (createOrDestroy, feedbackText, feedbackKind, feedbackDuration, displayLocation) {
    if (createOrDestroy !== undefined) {
        // if requested and the element is not present yet
        if (createOrDestroy && longLoadArrayNonPersistent.length === 0) {
            $('head').append(`<style id="tb-long-load-style-non-persistent">
                .mod-toolbox-rd #tb-bottombar, .mod-toolbox-rd #tb-bottombar-hidden {
                    bottom: 10px !important
                }
                </style>`);

            $body.append('<div id="tb-loading-non-persistent"></div>');

            longLoadArrayNonPersistent.push('load');

            // if requested and the element is already present
        } else if (createOrDestroy && longLoadArrayNonPersistent.length > 0) {
            longLoadArrayNonPersistent.push('load');

            // if done and the only instance
        } else if (!createOrDestroy && longLoadArrayNonPersistent.length === 1) {
            $('head').find('#tb-long-load-style-non-persistent').remove();
            $body.find('#tb-loading-non-persistent').remove();
            longLoadArrayNonPersistent.pop();

            // if done but other process still running
        } else if (!createOrDestroy && longLoadArrayNonPersistent.length > 1) {
            longLoadArrayNonPersistent.pop();
        }

        // Support for text feedback removing the need to fire two function calls from a module.
        if (feedbackText !== undefined && feedbackKind !== undefined) {
            textFeedback(feedbackText, feedbackKind, feedbackDuration, displayLocation);
        }
    }
}

export function beforeunload () {
    if (longLoadArray.length > 0) {
        return 'toolbox is still busy!';
    }
}

let contextTimeout;

/**
 * Add or remove a menu element to the context aware menu. Makes the menu
 * shows if it was empty before adding, hides menu if it is empty after removing.
 * @function
 * @param {string} triggerId This will be part of the id given to the element.
 * @param {object} options
 * @param {boolean} options.addTrigger Indicates of the menu item needs to
 * be added or removed.
 * @param {string} options.triggerText Text displayed in menu. Not needed
 * when addTrigger is false.
 * @param {string} options.triggerIcon The material icon that needs to be
 * displayed before the menu item. Defaults to 'label'
 * @param {string} options.title Title to be used in title attribute. If no
 * title is given the triggerText will be used.
 * @param {object} options.dataAttributes Any data attribute that might be
 * needed. Object keys will be used as the attribute name and value as value.
 */
export function contextTrigger (triggerId, options) {
    // We really don't need two context menus side by side.
    if (TBCore.isEmbedded) {
        return;
    }
    const addTrigger = options.addTrigger;
    // These elements we will need in the future.
    let $tbContextMenu = $body.find('#tb-context-menu');
    if (!$tbContextMenu.length) {
        // Toolbox context action menu.
        $tbContextMenu = $(`
                <div id="tb-context-menu" class="show-context-${contextMenuLocation}">
                    <div id="tb-context-menu-wrap">
                        <div id="tb-context-header">Toolbox context menu</div>
                        <ul id="tb-context-menu-list"></ul>
                    </div>
                    <i class="tb-icons tb-context-arrow" href="javascript:void(0)">${contextMenuLocation === 'left' ? icons.arrowRight : icons.arrowLeft}</i>
                </div>
            `).appendTo($body);
        $body.addClass(`tb-has-context-${contextMenuLocation}`);

        if (contextMenuClick) {
            $tbContextMenu.addClass('click-activated');

            $tbContextMenu.on('click', () => {
                if ($tbContextMenu.hasClass('open')) {
                    $tbContextMenu.removeClass('open');
                } else {
                    $tbContextMenu.addClass('open');
                }
            });
        } else {
            $tbContextMenu.addClass('hover-activated');
        }
    }
    const $tbContextMenuList = $body.find('#tb-context-menu-list');
    // We are adding a menu item.
    if (addTrigger) {
        const triggerText = options.triggerText;
        let triggerIcon = 'label';
        if (options.triggerIcon) {
            triggerIcon = options.triggerIcon;
        }

        const title = options.triggerText;

        // Check if there are currently items in the menu.
        const lengthBeforeAdd = $tbContextMenuList.find('li').length;

        // Build the new menu item.
        const $newMenuItem = $(`
                <li id="${triggerId}" title="${title}">
                    <i class="tb-icons">${triggerIcon}</i>
                    <span>${triggerText}<span>
                </li>
            `);

        // Add data attributes if needed.
        if (options.dataAttributes) {
            Object.entries(options.dataAttributes).forEach(([name, value]) => {
                $newMenuItem.attr(`data-${name}`, value);
            });
        }

        const $checkExists = $tbContextMenuList.find(`#${triggerId}`);

        // Check if an item with the same id is already in the menu. If so we will replace it.
        if ($checkExists.length) {
            $checkExists.replaceWith($newMenuItem);
        } else {
            // Add the item to the menu.
            $tbContextMenuList.append($newMenuItem);

            // We are going a bit annoying here to draw attention to the fact that there is a new item in the menu.
            // The alternative would be to always show the entire menu.
            $tbContextMenu.addClass(contextMenuAttention);
            clearTimeout(contextTimeout);
            contextTimeout = setTimeout(() => {
                $tbContextMenu.removeClass(contextMenuAttention);
            }, contextMenuAttention === 'fade' ? 6000 : 1000);
        }

        // If the menu was empty it was hidden and we need to show it.
        if (!lengthBeforeAdd) {
            $tbContextMenu.addClass('show-tb-context');
        }
    } else {
        // We are removing a menu item.
        $tbContextMenuList.find(`#${triggerId}`).remove();
        // Check the new menu length
        const newLength = $tbContextMenuList.find('li').length;
        // If there is nothing to show anymore we hide the menu.
        if (newLength < 1) {
            $tbContextMenu.removeClass('show-tb-context');
        }
    }
}

/**
 * Handles toolbox generated `thing` items as they become visible in the viewport.
 * @function
 * @param {IntersectionObserverEntry[]} entries
 * @param {IntersectionObserver} observer
 */
function handleTBThings (entries, observer) {
    entries.forEach(entry => {
        // The observer fires for everything on page load.
        // This makes sure that we really only act on those items that are visible.
        if (!entry.isIntersecting) {
            return;
        }

        // Element is visible, we only want to handle it once. Stop observing.
        observer.unobserve(entry.target);
        const $element = $(entry.target);

        if ($element.hasClass('tb-comment')) {
            const $jsApiPlaceholderComment = $element.find('> .tb-comment-entry > .tb-jsapi-comment-container');
            $jsApiPlaceholderComment.append('<span data-name="toolbox">');
            const jsApiPlaceholderComment = $jsApiPlaceholderComment[0];
            const $jsApiPlaceholderAuthor = $element.find('> .tb-comment-entry > .tb-tagline .tb-jsapi-author-container');
            const jsApiPlaceholderAuthor = $jsApiPlaceholderAuthor[0];
            $jsApiPlaceholderAuthor.append('<span data-name="toolbox">');
            const commentAuthor = $element.attr('data-comment-author'),
                  postID = $element.attr('data-comment-post-id'),
                  commentID = $element.attr('data-comment-id'),
                  subredditName = $element.attr('data-subreddit'),
                  subredditType = $element.attr('data-subreddit-type');

            // Comment
            if (!$jsApiPlaceholderComment.hasClass('tb-frontend-container')) {
                const detailObject = {
                    type: 'TBcomment',
                    data: {
                        author: commentAuthor,
                        post: {
                            id: postID,
                        },
                        id: commentID,
                        subreddit: {
                            name: subredditName,
                            type: subredditType,
                        },
                    },
                };
                const tbRedditEventComment = new CustomEvent('tbReddit', {detail: detailObject});
                jsApiPlaceholderComment.dispatchEvent(tbRedditEventComment);
            }
            // Author
            // We don't want to send events for things already handled.
            if (!$jsApiPlaceholderAuthor.hasClass('tb-frontend-container')) {
                const detailObject = {
                    type: 'TBcommentAuthor',
                    data: {
                        author: commentAuthor,
                        post: {
                            id: postID,
                        },
                        comment: {
                            id: commentID,
                        },
                        subreddit: {
                            name: subredditName,
                            type: subredditType,
                        },
                    },
                };
                const tbRedditEventAuthor = new CustomEvent('tbReddit', {detail: detailObject});
                jsApiPlaceholderAuthor.dispatchEvent(tbRedditEventAuthor);
            }
        }

        if ($element.hasClass('tb-submission')) {
            const $jsApiPlaceholderSubmission = $element.find('.tb-jsapi-submission-container');
            $jsApiPlaceholderSubmission.append('<span data-name="toolbox">');
            const jsApiPlaceholderSubmission = $jsApiPlaceholderSubmission[0];
            const $jsApiPlaceholderAuthor = $element.find('.tb-jsapi-author-container');
            $jsApiPlaceholderAuthor.append('<span data-name="toolbox">');
            const jsApiPlaceholderAuthor = $jsApiPlaceholderAuthor[0];

            const submissionAuthor = $element.attr('data-submission-author'),
                  postID = $element.attr('data-post-id'),
                  subredditName = $element.attr('data-subreddit'),
                  subredditType = $element.attr('data-subreddit-type');

            if (!$jsApiPlaceholderSubmission.hasClass('tb-frontend-container')) {
                const detailObject = {
                    type: 'TBpost',
                    data: {
                        author: submissionAuthor,
                        id: postID,
                        permalink: `https://www.reddit.com/r/${subredditName}/comments/${postID.substring(3)}/`,
                        subreddit: {
                            name: subredditName,
                            type: subredditType,
                        },
                    },
                };

                const tbRedditEventSubmission = new CustomEvent('tbReddit', {detail: detailObject});
                jsApiPlaceholderSubmission.dispatchEvent(tbRedditEventSubmission);
            }
            // We don't want to send events for things already handled.
            if (!$jsApiPlaceholderAuthor.hasClass('tb-frontend-container')) {
                const detailObject = {
                    type: 'TBpostAuthor',
                    data: {
                        author: submissionAuthor,
                        post: {
                            id: postID,
                        },
                        subreddit: {
                            name: subredditName,
                            type: subredditType,
                        },
                    },
                };
                const tbRedditEventAuthor = new CustomEvent('tbReddit', {detail: detailObject});
                jsApiPlaceholderAuthor.dispatchEvent(tbRedditEventAuthor);
            }
        }
    });
}

const viewportObserver = new IntersectionObserver(handleTBThings, {
    rootMargin: '200px',
});
/**
 * Will send out events similar to the reddit jsAPI events for the elements given.
 * Only support 'comment' for now and will only send the commentAuthor event.
 * @function
 * @param {object} $elements jquery object containing the elements for which jsAPI events need to be send.
 */
export function tbRedditEvent ($elements) {
    // $elements can also be a parent container, so we find our things first.
    const $tbThings = $elements.find('.tb-thing');
    $tbThings.each(function () {
        viewportObserver.observe(this);
    });
}

/**
 * Creates a jQuery element that dynamically displays paginated content.
 * @param {object} options Options for the pager
 * @param {number} options.pageCount The number of pages to present
 * @param {string} options.controlPosition Where to display the pager's
 * controls, either 'top' or 'bottom'
 * @param {TBui~pagerCallback} contentFunction A function which generates
 * content for a given page
 * @returns {jQuery}
 */
// TODO: optionally support caching calls to the content function to avoid wasting time regenerating identical pages
export function pager ({pageCount, controlPosition = 'top'}, contentFunction) {
    // Create elements for the content view and the pagination controls
    const $pagerContent = $('<div class="tb-pager-content"/>');
    const $pagerControls = $('<div class="tb-pager-controls"/>');

    // An array of all the button elements that could be displayed, one for each page
    const buttons = [];

    // A function that refreshes the displayed buttons based on the selected page
    function loadPage (pageIndex) {
        // If we have more than 10 pages, refresh the buttons that are being actively displayed
        if (pageCount > 10) {
            // Empty the existing buttons out, using .detach to maintain event listeners, then using .empty() to
            // remove the text left behind (thanks jQuery)
            $pagerControls.children().detach();
            $pagerControls.empty();

            // Add the buttons in the center
            const leftBound = Math.max(pageIndex - 4, 0);
            const rightBound = Math.min(pageIndex + 4, pageCount - 1);
            for (let buttonIndex = leftBound; buttonIndex <= rightBound; buttonIndex += 1) {
                $pagerControls.append(buttons[buttonIndex]);
            }

            // Add the first and last page buttons, along with "..." between them and the other buttons if there's
            // distance between them
            if (leftBound > 1) {
                $pagerControls.prepend('...');
            }
            if (leftBound > 0) {
                $pagerControls.prepend(buttons[0]);
            }
            if (rightBound < pageCount - 2) {
                $pagerControls.append('...');
            }
            if (rightBound < pageCount - 1) {
                $pagerControls.append(buttons[pageCount - 1]);
            }
        } else if ($pagerControls.children().length === 0) {
            // If we have less than 10 items, then we only need to refresh the buttons the first time they're loaded
            buttons.forEach($button => $pagerControls.append($button));
        }

        // Move selection to the correct button
        $pagerControls.children().toggleClass('tb-pager-control-active', false);
        buttons[pageIndex].toggleClass('tb-pager-control-active', true);

        // Generate and display content for the new page
        /**
         * @callback TBui~pagerCallback
         * @param {number} page The zero-indexed number of the page to generate
         * @returns {string | jQuery} The content of the page
         */
        $pagerContent.empty().append(contentFunction(pageIndex));
    }

    // Create all the buttons
    for (let page = 0; page < pageCount; page += 1) {
        // Create the button, translating 0-indexed to 1-indexed pages fur human eyes
        const $button = $(button(page + 1, 'tb-pager-control'));

        // When the button is clicked, go to the correct page
        $button.on('click', () => {
            loadPage(page);
        });

        // Add to the array
        buttons.push($button);
    }

    // Construct the pager itself
    const $pager = $('<div class="tb-pager"/>');
    $pager.append($pagerContent);
    if (controlPosition === 'top') {
        $pager.prepend($pagerControls);
    } else if (controlPosition === 'bottom') {
        $pager.append($pagerControls);
    } else {
        throw new TypeError('Invalid controlPosition');
    }

    // Preload the content for the first page
    loadPage(0);

    return $pager;
}

/**
 * Creates a pager over a dataset.
 * @param {object} options
 * @param {any[]} items The items to display in the pager
 * @param {number} perPage The number of items to display on each page
 * @param {TBui~pagerForItemsCallback} displayItem A function that generates
 * content for each individual item in the dataset
 * @param {string} controlPosition Where to display the pager's controls,
 * either 'top' or 'bottom'
 * @param {string} [wrapper='<div>'] Used to provide custom wrapper markup for
 * each page of items
 * @returns {jQuery}
 */
export function pagerForItems ({
    items,
    perPage,
    displayItem,
    controlPosition,
    wrapper = '<div>',
}) {
    return pager({
        controlPosition,
        pageCount: Math.ceil(items.length / perPage),
    }, page => {
        const $wrapper = $(wrapper);
        const start = page * perPage;
        const end = (page + 1) * perPage;
        for (let i = start; i < end && i < items.length; i += 1) {
            $wrapper.append(displayItem(items[i], i));
        }
        return $wrapper;
    });
}

// Misc.

/** Reloads the extension, then reloads the current window. */
export function reloadToolbox () {
    textFeedback('toolbox is reloading', FEEDBACK_POSITIVE, 10000, DISPLAY_BOTTOM);
    browser.runtime.sendMessage({action: 'tb-reload'}).then(() => {
        window.location.reload();
    });
}

// Utilities

export function getBestTextColor (bgColor) {
    if (!getBestTextColor.cache[bgColor]) {
        const textColors = ['black', 'white'];
        getBestTextColor.cache[bgColor] = tinycolor.mostReadable(bgColor, textColors).toHexString();
    }
    return getBestTextColor.cache[bgColor];
}
getBestTextColor.cache = {};

// Trigger a prompt if the user tries to close the tab while we're doing things
window.onbeforeunload = function () {
    if (longLoadArray.length > 0) {
        return 'toolbox is still busy!';
    }
};

import $ from 'jquery';

import {Module} from '../tbmodule.js';

const self = new Module({
    name: 'Demo Module',
    id: 'DemoModule',
    enabledByDefault: true,
    oldReddit: true,
    settings: [
        {
            id: 'booleanSetting',
            description: 'Enable disable this setting.',
            type: 'boolean',
            default: false,
        },
    ],
}, ({
    booleanSetting,
}) => {
    if (booleanSetting) {
        console.log('booleanSetting', booleanSetting);
    }
});
export default self;

// Bread and buttons
const $body = $('body');


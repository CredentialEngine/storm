import _ from 'lodash';

var $ = require('jquery');
window.jQuery = $;
window.$ = $;

var xml2js = require('xml2js');
window.xml2js = xml2js;

function component() {
    let element = document.createElement('div');

    // Lodash, currently included via a script, is required for this line to work
    //element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
}

//document.body.appendChild(component());

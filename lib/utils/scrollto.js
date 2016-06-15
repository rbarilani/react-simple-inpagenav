'use strict';

var $ = require('jquery/dist/jquery');
var _ = require('lodash');

var DEFAULT_OPTIONS = {
    duration: 400,
    offset: 0,
    easing: 'swing',
    onAfter: function onAfter() {}
};

function scrollto($toElement, options, timeout, $element) {

    var opt = _.extend({}, scrollto.DEFAULT_OPTIONS, options || {});
    var props = { scrollTop: $toElement.offset().top + options.offset };

    setTimeout(function () {
        $($element || 'html, body').animate(props, opt.duration, opt.easing, opt.onAfter);
    }, timeout || 0);
}

scrollto.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = scrollto;
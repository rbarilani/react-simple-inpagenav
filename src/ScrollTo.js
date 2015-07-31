var $ = require('jquery');
var _ = require('lodash');

var DEFAULT_OPTIONS = {
  duration: 400,
  offset: 0,
  easing: 'swing',
  onAfter: function () {}
};


module.exports = function ($element, options) {
    var opt = _.extend({}, DEFAULT_OPTIONS, options || {});
    var props = { scrollTop: $element.offset().top + options.offset };

    $('html, body').animate(
        props,
        opt.duration,
        opt.easing,
        opt.onAfter
    );
};

var $ = require('jquery');
var _ = require('lodash');

var DEFAULT_OPTIONS = {
  duration: 400,
  offset: 0,
  easing: 'swing',
  onAfter: function () {}
};

function scrollto($toElement, options, $element) {

    var opt = _.extend({}, scrollto.DEFAULT_OPTIONS, options || {});
    var props = { scrollTop: $toElement.offset().top + options.offset };

    $($element || 'html, body').animate(
        props,
        opt.duration,
        opt.easing,
        opt.onAfter
    );
}

scrollto.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = scrollto;

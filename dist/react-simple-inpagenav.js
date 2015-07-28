(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SimpleInpagenav = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var BarItem = require('./BarItem');

/**
 *
 * Bar component
 * @type {Bar}
 *
 */
var Bar = React.createClass({
    displayName: 'Bar',

    componentDidMount: function componentDidMount() {
        React.Children.forEach(this.props.children, function (child) {
            this.registerItem(child.props.target);
        }, this);
    },
    render: function render() {
        var navbarItemChildrenFound = false;
        var children = React.Children.map(this.props.children, function (child) {
            if (child.type === BarItem) {
                navbarItemChildrenFound = true;
                return React.cloneElement(child, {
                    currentTarget: this.props.currentTarget,
                    onClickCallback: this.props.onItemClickCallback
                });
            }
            return child;
        }, this);

        // we need at least a NavbarItem child
        if (!navbarItemChildrenFound) {
            throw 'A "SimpleInpagenav.Navbar" component must have at least one "SimpleInpagenav.NavbarItem" child';
        }

        return React.createElement(
            'nav',
            { className: "simple-inpagenav-bar" },
            React.createElement(
                'ul',
                null,
                children
            )
        );
    },
    items: {},
    registerItem: function registerItem(target) {
        if (this.items[target]) {
            throw 'Target for an "NavbarItem" must be unique!';
        }
        this.items[target] = target;
    }
});

module.exports = Bar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./BarItem":2}],2:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

/**
 *
 * BarItem Component
 * @type {BarItem}
 *
 */
var BarItem = React.createClass({
    displayName: 'BarItem',

    propTypes: {
        target: React.PropTypes.string.isRequired
    },
    render: function render() {
        var className = this.props.currentTarget === this.props.target ? 'active' : '';
        return React.createElement(
            'li',
            null,
            React.createElement(
                'a',
                { href: '#' + this.props.target, className: className, onClick: this.onClick },
                this.props.children
            )
        );
    },
    onClick: function onClick(event) {
        event.preventDefault();
        this.props.onClickCallback(this.props.target); // inform parent that a navbar item was clicked!
    }
});

module.exports = BarItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
'use strict';

var CONSTANTS = {
    SECTION_ID_SUFFIX: '__simple-inpagenav',
    DEBOUNCED_SCROLL_EVENT: 'simple-inpagenav.scroll',
    SCROLL_EVENT: 'scroll.simpleinapgenav',
    LOAD_EVENT: 'load.simpleinpagenav',
    RESIZE_EVENT: 'resize.simpleinpagenav',
    DEBOUNCED_SCROLL_EVENT_DELAY: 300,
    DEFAULT_OPTIONS: {
        scrollThreshold: 0.4,
        scrollOffset: 50,
        scrollTo: {
            duration: 300,
            offset: -40
        }
    }
};

module.exports = CONSTANTS;

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var CONSTANTS = require('./Constants');

/**
 *
 * Section Component
 * @type {Section}
 *
 */
var Section = React.createClass({
    displayName: 'Section',

    propTypes: {
        target: React.PropTypes.string.isRequired
    },
    componentDidMount: function componentDidMount() {
        this.props.registerSection(this.props.target, this.getId());
    },
    getId: function getId() {
        return this.props.target + CONSTANTS.SECTION_ID_SUFFIX;
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: "simple-inpagenav-section", id: this.getId() },
            this.props.children
        );
    }
});

module.exports = Section;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Constants":3}],5:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var $scrollTo = (typeof window !== "undefined" ? window['$']['scrollTo'] : typeof global !== "undefined" ? global['$']['scrollTo'] : null);

var CONSTANTS = require('./Constants');
var BarItem = require('./BarItem');
var Bar = require('./Bar');
var Section = require('./Section');

/**
 *
 * SimpleInpagenav Component
 * @type {SimpleInpagenav}
 *
 */
var SimpleInpagenav = React.createClass({
    displayName: 'SimpleInpagenav',

    getInitialState: function getInitialState() {
        return {
            currentTarget: null
        };
    },
    getDefaultProps: function getDefaultProps() {
        return { options: _.extend({}, CONSTANTS.DEFAULT_OPTIONS) };
    },
    componentDidMount: function componentDidMount() {
        // wait for window load, because we have to rely on the top position of a section.
        // if we don't wait for images, etc. we end up with wrong values
        this.$window.on(CONSTANTS.LOAD_EVENT, (function () {
            // activate our custom "debounced" scroll event
            this.debouncedScroll();
            // updates options
            this.options = _.merge({}, this.options, this.props.options || {});
            // scrollTo target if hash match an existent section
            if (this.hasUsableLocation()) {
                this.updatesCurrentTarget(this.getTargetFromLocation());
                this.scrollTo(this.getSectionElement(this.getTargetFromLocation()), this.getOptions().scrollTo);
            } else {
                // updates state with current visible target
                this.updatesCurrentTarget();
            }
            // listen our custom debounced event
            this.$window.on(CONSTANTS.DEBOUNCED_SCROLL_EVENT, (function () {
                if (this.shouldReactOnScroll) {
                    var target = this.getCurrentSectionTarget();
                    this.updatesLocation(target);
                    this.updatesCurrentTarget(target);
                }
            }).bind(this));
            // listen resize an adjust sections positions
            this.$window.on(CONSTANTS.RESIZE_EVENT, (function () {
                this.updatesSectionPositions();
            }).bind(this));
        }).bind(this));
    },
    componentWillUnmount: function componentWillUnmount() {
        // unbind events
        this.$window.off(CONSTANTS.LOAD_EVENT);
        this.$window.off(CONSTANTS.RESIZE_EVENT);
        this.$window.off(CONSTANTS.SCROLL_EVENT);
        this.$window.off(CONSTANTS.DEBOUNCED_SCROLL_EVENT);
    },
    render: function render() {
        var sectionChildrenFound = false;
        var children = React.Children.map(this.props.children, function (child) {
            switch (child.type) {
                case Section:
                    sectionChildrenFound = true;
                    return React.cloneElement(child, {
                        registerSection: this.registerSection
                    });
                case Bar:
                    return React.cloneElement(child, {
                        currentTarget: this.state.currentTarget,
                        onItemClickCallback: this.onItemClick
                    });
                default:
                    return child;
            }
        }, this);
        // we need at least a section child
        if (!sectionChildrenFound) {
            throw 'A "SimpleInpagenav" component must have at least one "SimpleInpagenav.Section" child';
        }
        return React.createElement(
            'div',
            { className: "simple-inpagenav" },
            children
        );
    },
    /**
     * Flag to react or don't react when user scroll (example: when we scroll the window with scrollTo)
     * @type {boolean}
     */
    shouldReactOnScroll: true,
    /**
     * Save a jquery window reference for further use
     * @type {jQuery}
     */
    $window: $(window),
    /**
     * Map like object for registered sections
     * @type {object}
     */
    sections: {},
    /**
     * @type {object}
     */
    options: _.merge({}, CONSTANTS.DEFAULT_OPTIONS),
    /**
     * Updates currentTarget state property
     * @param {string} [target]
     */
    updatesCurrentTarget: function updatesCurrentTarget(target) {
        this.setState({ currentTarget: target || this.getCurrentSectionTarget() });
    },
    /**
     * Scroll to an element with animation
     * @param {jQuery|HTMLElement} element
     * @param {object} options - scrollTo options
     */
    scrollTo: function scrollTo(element, options) {
        options.onAfter = (function () {
            this.shouldReactOnScroll = true;
        }).bind(this);
        $scrollTo(element, options);
    },
    /**
     * Fired when a bar item was clicked
     * @param {string} target
     */
    onItemClick: function onItemClick(target) {
        this.shouldReactOnScroll = false;
        this.scrollTo(this.getSectionElement(target), this.getOptions().scrollTo);
        this.updatesLocation(target);
        this.setState({ currentTarget: target });
    },
    /**
     * Try to retrieve the current section target (match "visible" area)
     * @returns {string}
     */
    getCurrentSectionTarget: function getCurrentSectionTarget() {
        var returnValue = null;
        var sections = [];

        for (var section in this.sections) {
            if (this.sections.hasOwnProperty(section)) {
                sections.push({ target: section, pos: this.sections[section] });
            }
        }
        sections = _.sortByOrder(sections, function (sec) {
            return sec.pos;
        }, ['desc']);

        // scroll reach the bottom
        // current section is the "last" (more close to the bottom of the display)
        if (this.scrollReachTheBottom()) {
            returnValue = sections[0].target;
            return returnValue;
        }

        for (var i = 0; i < sections.length; i++) {
            if (this.isTheVisibleArea(sections[i].pos)) {
                returnValue = sections[i].target;
                break;
            }
        }
        return returnValue;
    },
    /**
     * Updates window location hash
     * @param {string} target
     */
    updatesLocation: function updatesLocation(target) {
        window.location.hash = '#' + target;
    },
    /**
     * Check if we can use the location hash to scroll to a section
     * @returns {boolean}
     */
    hasUsableLocation: function hasUsableLocation() {
        var target = this.getTargetFromLocation();
        return this.sections[target] ? true : false;
    },
    /**
     * Get the target string from the current window location
     * @returns {string|null}
     */
    getTargetFromLocation: function getTargetFromLocation() {
        return window.location.hash ? window.location.hash.substr(1) : null;
    },
    /**
     * Listen our custom "debounced" scroll event
     */
    debouncedScroll: function debouncedScroll() {
        var scrollTimer;
        this.$window.on(CONSTANTS.SCROLL_EVENT, (function (e) {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout((function () {
                this.$window.trigger(CONSTANTS.DEBOUNCED_SCROLL_EVENT, { scrollEvent: e });
            }).bind(this), CONSTANTS.DEBOUNCED_SCROLL_EVENT_DELAY);
        }).bind(this));
    },
    /**
     * Check if scroll reached the bottom of the page
     * @returns {boolean}
     */
    scrollReachTheBottom: function scrollReachTheBottom() {
        return this.$window.scrollTop() + this.$window.height() === $(document).height();
    },
    /**
     * Check if pos could be interpreted as a visible area
     * @param {number} pos
     * @returns {boolean}
     */
    isTheVisibleArea: function isTheVisibleArea(pos) {
        var windowPos = this.$window.scrollTop();
        var windowHeight = Math.round(this.$window.height() * this.getOptions().scrollThreshold);

        return pos - windowHeight < windowPos + this.getOptions().scrollOffset;
    },
    /**
     * Return a section element
     * @param {string} target
     * @returns {jQuery|HTMLElement}
     */
    getSectionElement: function getSectionElement(target) {
        return $('#' + this.getSectionId(target));
    },
    /**
     * Return the DOM id for a section
     * @param {string} target
     * @returns {string}
     */
    getSectionId: function getSectionId(target) {
        return target + CONSTANTS.SECTION_ID_SUFFIX;
    },
    /**
     * Get section position
     * @param {string} id - section DOM id
     * @returns {number}
     */
    getSectionPos: function getSectionPos(id) {
        var $section = $('#' + id);
        return Math.round($section.offset().top);
    },
    /**
     * Add a section
     * @param {string} target
     * @param {string} id - section DOM id
     */
    registerSection: function registerSection(target, id) {
        if (this.sections[target]) {
            throw 'Target for a section must be unique!';
        }
        this.sections[target] = this.getSectionPos(id);
    },
    /**
     * Updates section positions (example: when user resize the window)
     */
    updatesSectionPositions: function updatesSectionPositions() {
        for (var target in this.sections) {
            if (this.sections.hasOwnProperty(target)) {
                this.sections[target] = this.getSectionPos(this.getSectionId(target));
            }
        }
    },
    /**
     * Get component options
     * @returns {object}
     */
    getOptions: function getOptions() {
        return this.options;
    }
});

SimpleInpagenav.Section = Section;
SimpleInpagenav.Bar = Bar;
SimpleInpagenav.BarItem = BarItem;

module.exports = SimpleInpagenav;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Bar":1,"./BarItem":2,"./Constants":3,"./Section":4}]},{},[5])(5)
});
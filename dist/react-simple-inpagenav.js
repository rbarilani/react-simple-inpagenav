(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SimpleInpagenav = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var $scrollTo = (typeof window !== "undefined" ? window['$']['scrollTo'] : typeof global !== "undefined" ? global['$']['scrollTo'] : null);

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
            if (child.type === Section) {
                sectionChildrenFound = true;
                return React.cloneElement(child, {
                    registerSection: this.registerSection
                });
            } else if (child.type === Bar) {
                return React.cloneElement(child, {
                    currentTarget: this.state.currentTarget,
                    onItemClickCallback: this.onItemClick
                });
            }
            return child;
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
    shouldReactOnScroll: true,
    $window: $(window),
    sections: {},
    options: _.merge({}, CONSTANTS.DEFAULT_OPTIONS),
    updatesCurrentTarget: function updatesCurrentTarget(target) {
        this.setState({ currentTarget: target || this.getCurrentSectionTarget() });
    },
    scrollTo: function scrollTo(element, options) {
        options.onAfter = (function () {
            this.shouldReactOnScroll = true;
        }).bind(this);
        $scrollTo(element, options);
    },
    onItemClick: function onItemClick(target) {
        this.shouldReactOnScroll = false;
        this.scrollTo(this.getSectionElement(target), this.getOptions().scrollTo);
        this.updatesLocation(target);
        this.setState({ currentTarget: target });
    },
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
    updatesLocation: function updatesLocation(target) {
        window.location.hash = '#' + target;
    },
    hasUsableLocation: function hasUsableLocation() {
        var target = this.getTargetFromLocation();
        return this.sections[target] ? true : false;
    },
    getTargetFromLocation: function getTargetFromLocation() {
        return window.location.hash ? window.location.hash.substr(1) : null;
    },
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
    scrollReachTheBottom: function scrollReachTheBottom() {
        return this.$window.scrollTop() + this.$window.height() === $(document).height();
    },
    isTheVisibleArea: function isTheVisibleArea(pos) {
        var windowPos = this.$window.scrollTop();
        var windowHeight = Math.round(this.$window.height() * this.getOptions().scrollThreshold);

        return pos - windowHeight < windowPos + this.getOptions().scrollOffset;
    },
    getSectionElement: function getSectionElement(target) {
        return $('#' + this.getSectionId(target));
    },
    getSectionId: function getSectionId(target) {
        return target + CONSTANTS.SECTION_ID_SUFFIX;
    },
    getSectionPos: function getSectionPos(id) {
        var $section = $('#' + id);
        return Math.round($section.offset().top);
    },
    registerSection: function registerSection(target, id) {
        if (this.sections[target]) {
            throw 'Target for a section must be unique!';
        }
        this.sections[target] = this.getSectionPos(id);
    },
    updatesSectionPositions: function updatesSectionPositions() {
        for (var target in this.sections) {
            if (this.sections.hasOwnProperty(target)) {
                this.sections[target] = this.getSectionPos(this.getSectionId(target));
            }
        }
    },
    getOptions: function getOptions() {
        return this.options;
    }
});

SimpleInpagenav.Section = Section;
SimpleInpagenav.Bar = Bar;
SimpleInpagenav.BarItem = BarItem;

module.exports = SimpleInpagenav;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
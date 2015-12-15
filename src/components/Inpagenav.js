var React = require('react');
var $ = require('jquery');
var _ = require('lodash');

var CONSTANTS = require('../constants/Constants');
var $scrollTo = require('../utils/scrollto.js');
var BarItem = require('./BarItem');
var Bar = require('./Bar');
var Section = require('./Section');
const queryString = require('query-string');

/**
 *
 * SimpleInpagenav Component
 * @type {SimpleInpagenav}
 *
 */
var SimpleInpagenav = React.createClass({
    _hashParams: {},
    getInitialState: function () {
        return {
            currentTarget: null
        };
    },
    getDefaultProps: function () {
        return {options: _.extend({}, CONSTANTS.DEFAULT_OPTIONS)};
    },
    componentDidMount: function () {
        // wait for window load, because we have to rely on the top position of a section.
        // if we don't wait for images, etc. we end up with wrong values
        this.$window.on(CONSTANTS.LOAD_EVENT, function () {
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
            this.$window.on(CONSTANTS.DEBOUNCED_SCROLL_EVENT, function () {
                if (this.shouldReactOnScroll) {
                    var target = this.getCurrentSectionTarget();
                    this.updatesLocation(target);
                    this.updatesCurrentTarget(target);
                }
            }.bind(this));
            // listen resize an adjust sections positions
            this.$window.on(CONSTANTS.RESIZE_EVENT, function () {
                this.updatesSectionPositions();
            }.bind(this));
        }.bind(this));
    },
    componentWillUnmount: function () {
        // unbind events
        this.$window.off(CONSTANTS.LOAD_EVENT);
        this.$window.off(CONSTANTS.RESIZE_EVENT);
        this.$window.off(CONSTANTS.SCROLL_EVENT);
        this.$window.off(CONSTANTS.DEBOUNCED_SCROLL_EVENT);
    },
    render: function () {
        var sectionChildrenFound = false;
        var children = React.Children.map(this.props.children, function (child) {
            switch (child.type) {
                case Section:
                    sectionChildrenFound = true;
                    return React.cloneElement(child, {
                        registerSection: this.registerSection,
                        idSuffix: CONSTANTS.SECTION_ID_SUFFIX
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
        return (
            <div className="simple-inpagenav">
                {children}
            </div>
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
    updatesCurrentTarget: function (target) {
        this.setState({currentTarget: target || this.getCurrentSectionTarget()});
    },
    /**
     * Scroll to an element with animation
     * @param {jQuery|HTMLElement} element
     * @param {object} options - scrollTo options
     */
    scrollTo: function (element, options) {
        options.onAfter = function () {
            this.shouldReactOnScroll = true;
        }.bind(this);
        $scrollTo(element, options);
    },
    /**
     * Fired when a bar item was clicked
     * @param {string} target
     */
    onItemClick: function (target) {
        this.shouldReactOnScroll = false;
        this.scrollTo(this.getSectionElement(target), this.getOptions().scrollTo);
        this.updatesLocation(target);
        this.setState({currentTarget: target});
    },
    /**
     * Try to retrieve the current section target (match "visible" area)
     * @returns {string}
     */
    getCurrentSectionTarget: function () {
        var returnValue = null;
        var sections = [];

        for (var section in this.sections) {
            if (this.sections.hasOwnProperty(section)) {
                sections.push({target: section, pos: this.sections[section]});
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
    updatesLocation: function (target) {
        this.initHashParams(window.location.hash ? window.location.hash.substr(1) : null);
        window.location.hash = '#' + target + (Object.keys(this._hashParams).length ? '?' + queryString.stringify(this._hashParams) : '');
    },
    /**
     * Check if we can use the location hash to scroll to a section
     * @returns {boolean}
     */
    hasUsableLocation: function () {
        var target = this.getTargetFromLocation();
        return this.sections[target] ? true : false;
    },
    initHashParams: function (hash) {
        if(!hash) {return;}
        let match = hash.match(/\?.*$/);
        if(match && match[0]) {
            this._hashParams = queryString.parse(match[0]);
        }
    },
    getHashParams: function () {
      return this._hashParams;
    },
    /**
     * Get the target string from the current window location
     * @returns {string|null}
     */
    getTargetFromLocation: function () {
        let target = window.location.hash ? window.location.hash.substr(1) : null;
        this.initHashParams(target);
        return target;
    },
    /**
     * Listen our custom "debounced" scroll event
     */
    debouncedScroll: function () {
        var scrollTimer;
        this.$window.on(CONSTANTS.SCROLL_EVENT, function (e) {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(function () {
                this.$window.trigger(CONSTANTS.DEBOUNCED_SCROLL_EVENT, {scrollEvent: e});
            }.bind(this), CONSTANTS.DEBOUNCED_SCROLL_EVENT_DELAY);
        }.bind(this));
    },
    /**
     * Check if scroll reached the bottom of the page
     * @returns {boolean}
     */
    scrollReachTheBottom: function () {
        return this.$window.scrollTop() + this.$window.height() === $(document).height();
    },
    /**
     * Check if pos could be interpreted as a visible area
     * @param {number} pos
     * @returns {boolean}
     */
    isTheVisibleArea: function (pos) {
        var windowPos = this.$window.scrollTop();
        var windowHeight = Math.round(this.$window.height() * this.getOptions().scrollThreshold);

        return (pos - windowHeight) < ( windowPos + this.getOptions().scrollOffset);
    },
    /**
     * Return a section element
     * @param {string} target
     * @returns {jQuery|HTMLElement}
     */
    getSectionElement: function (target) {
        return $('#' + this.getSectionId(target));
    },
    /**
     * Return the DOM id for a section
     * @param {string} target
     * @returns {string}
     */
    getSectionId: function (target) {
        return target + CONSTANTS.SECTION_ID_SUFFIX;
    },
    /**
     * Get section position
     * @param {string} id - section DOM id
     * @returns {number}
     */
    getSectionPos: function (id) {
        var $section = $('#' + id);
        return Math.round($section.offset().top);
    },
    /**
     * Add a section
     * @param {string} target
     * @param {string} id - section DOM id
     */
    registerSection: function (target, id) {
        if (this.sections[target]) {
            throw 'Target for a section must be unique!';
        }
        this.sections[target] = this.getSectionPos(id);
    },
    /**
     * Updates section positions (example: when user resize the window)
     */
    updatesSectionPositions: function () {
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
    getOptions: function () {
        return this.options;
    }
});

SimpleInpagenav.Section = Section;
SimpleInpagenav.Bar = Bar;
SimpleInpagenav.BarItem = BarItem;

module.exports = SimpleInpagenav;

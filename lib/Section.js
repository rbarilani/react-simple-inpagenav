'use strict';

var React = require('react');
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
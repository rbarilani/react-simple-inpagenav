'use strict';

var React = require('react');

/*
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
        return this.props.target + (this.props.idSuffix || '');
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
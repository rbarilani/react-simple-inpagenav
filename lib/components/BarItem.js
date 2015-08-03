'use strict';

var React = require('react');

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
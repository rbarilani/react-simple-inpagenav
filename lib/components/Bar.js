'use strict';

var React = require('react');
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
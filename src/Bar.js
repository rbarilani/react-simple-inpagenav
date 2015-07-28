var React = require('react');
var BarItem = require('./BarItem');

/**
 *
 * Bar component
 * @type {Bar}
 *
 */
var Bar = React.createClass({
    componentDidMount: function () {
        React.Children.forEach(this.props.children, function (child) {
            this.registerItem(child.props.target);
        }, this);
    },
    render: function () {
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

        return (
            <nav className="simple-inpagenav-bar">
                <ul>{children}</ul>
            </nav>
        );
    },
    items: {},
    registerItem: function (target) {
        if (this.items[target]) {
            throw 'Target for an "NavbarItem" must be unique!';
        }
        this.items[target] = target;
    }
});

module.exports = Bar;

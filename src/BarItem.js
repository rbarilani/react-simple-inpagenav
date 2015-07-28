var React = require('react');

/**
 *
 * BarItem Component
 * @type {BarItem}
 *
 */
var BarItem = React.createClass({
    propTypes: {
        target: React.PropTypes.string.isRequired
    },
    render: function () {
        var className = this.props.currentTarget === this.props.target ? 'active' : '';
        return (
            <li>
                <a href={'#' + this.props.target} className={className} onClick={this.onClick}>
                    {this.props.children}
                </a>
            </li>
        );
    },
    onClick: function (event) {
        event.preventDefault();
        this.props.onClickCallback(this.props.target); // inform parent that a navbar item was clicked!
    }
});

module.exports = BarItem;

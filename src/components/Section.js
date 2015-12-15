var React = require('react');

/*
 * Section Component
 * @type {Section}
 *
 */
var Section = React.createClass({
    componentDidMount: function () {
        this.props.registerSection(this.props.target, this.getId());
    },
    getId: function () {
        return this.props.target + (this.props.idSuffix || '');
    },
    render: function () {
        return (
            <div className="simple-inpagenav-section" id={this.getId()}>
                {this.props.children}
            </div>
        );
    }
});

module.exports = Section;

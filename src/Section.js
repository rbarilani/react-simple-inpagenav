var React = require('react');
var CONSTANTS = require('./Constants');

/**
 *
 * Section Component
 * @type {Section}
 *
 */
var Section = React.createClass({
    propTypes: {
        target: React.PropTypes.string.isRequired
    },
    componentDidMount: function () {
        this.props.registerSection(this.props.target, this.getId());
    },
    getId: function () {
        return this.props.target + CONSTANTS.SECTION_ID_SUFFIX;
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

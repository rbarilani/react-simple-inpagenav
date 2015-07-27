var React = require('react');
var $ = require('jquery');
var _ = require('lodash');
var $scrollTo = require('jquery.scrollto');

var CONSTANTS = {
	SECTION_ID_SUFFIX: '__simple-inpagenav',
	DEBOUNCED_SCROLL_EVENT: 'simple-inpagenav.scroll',
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

/**
 * SimpleInpagenav Component
 * @type {SimpleInpagenav}
 */
var SimpleInpagenav = React.createClass({
	getInitialState: function () {
		return {
			currentTarget: null
		};
	},
	getDefaultProps: function() {
		return { options: _.extend({}, CONSTANTS.DEFAULT_OPTIONS) };
	},
	componentDidMount: function () {
		// activate our custom "debounced" scroll event
		this.debouncedScroll();
		this.updatesCurrentTarget();
		this.$window.on(CONSTANTS.DEBOUNCED_SCROLL_EVENT, function () {
			if(this.shouldReactOnScroll) {
				var target = this.getCurrentSectionTarget();
				this.updatesLocationHash(target);
				this.updatesCurrentTarget(target);
			}
		}.bind(this));
	},
	render: function () {
		var sectionChildrenFound = false;
		var children = React.Children.map(this.props.children, function (child) {
			if (child.type === Section) {
				sectionChildrenFound = true;
				return React.cloneElement(child, {
					registerSection: this.registerSection
				});
			} else if (child.type === Bar ){
				return React.cloneElement(child, {
					currentTarget: this.state.currentTarget,
					onItemClickCallback: this.onItemClick
				});
			}
			return child;
		}, this);
		// we need at least a section child
		if(!sectionChildrenFound) {
			throw 'A "SimpleInpagenav" component must have at least one "SimpleInpagenav.Section" child';
		}
		return (
			<div className="simple-inpagenav">
				{children}
			</div>
		);
	},
	shouldReactOnScroll: true,
	updatesCurrentTarget: function (target) {
		this.setState({currentTarget: target || this.getCurrentSectionTarget() });
	},
	scrollTo: function(element, options) {
		options.onAfter = function () {
			this.shouldReactOnScroll = true;
		}.bind(this);
		$scrollTo(element, options);
	},
	onItemClick: function (target) {
		this.shouldReactOnScroll = false;
		this.scrollTo(this.getSectionElement(target), this.props.options.scrollTo);
		this.updatesLocationHash(target);
		this.setState({currentTarget: target});
	},
	getCurrentSectionTarget: function () {
		var returnValue = null;
		var sections = [];

		for (var section in this.sections) {
			if(this.sections.hasOwnProperty(section)) {
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
			if ( this.isTheVisibleArea(sections[i].pos) ) {
				returnValue = sections[i].target;
				break;
			}
		}
		return returnValue;
	},
	updatesLocationHash: function (target) {
		window.location.hash = '#' + target;
	},
	debouncedScroll: function () {
		var scrollTimer;
		this.$window.on('scroll', function(e) {
			if (scrollTimer) { clearTimeout(scrollTimer); }
			scrollTimer = setTimeout(function() {
				this.$window.trigger(CONSTANTS.DEBOUNCED_SCROLL_EVENT, { scrollEvent: e });
			}.bind(this), CONSTANTS.DEBOUNCED_SCROLL_EVENT_DELAY);
		}.bind(this));
	},
	scrollReachTheBottom: function () {
		return this.$window.scrollTop() + this.$window.height() === $(document).height();
	},
	isTheVisibleArea: function (pos) {
		var windowPos = this.$window.scrollTop();
		var windowHeight = Math.round(this.$window.height() * this.props.options.scrollThreshold);

		return (pos - windowHeight) < ( windowPos + this.props.options.scrollOffset);
	},
	$window: $(window),
	sections: {},
	getSectionElement: function (target) {
		return $('#' + target + CONSTANTS.SECTION_ID_SUFFIX);
	},

	getSectionPos: function (id) {
		var $section = $('#' + id);
		return Math.round($section.offset().top);
	},
	registerSection: function (target, id) {
		if(this.sections[target]) {
			throw 'Target for a section must be unique!';
		}
		this.sections[target] = this.getSectionPos(id);
	}
});

SimpleInpagenav.Section = Section;
SimpleInpagenav.Bar = Bar;
SimpleInpagenav.BarItem = BarItem;

module.exports = SimpleInpagenav;

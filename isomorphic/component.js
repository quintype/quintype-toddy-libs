const React = require("react");
const { connect } = require("react-redux");

class IsomorphicComponentBase extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentPath != prevProps.currentPath) {
      window.scrollTo(0, 0);
    }

    if (this.props.title) global.document.title = this.props.title;
  }

  render() {
    const props = Object.assign({}, this.props, {
      key: this.props.currentPath || ""
    });
    return React.createElement(
      this.props.pickComponent(this.props.pageType, this.props.subPageType),
      props
    );
  }
}

function mapStateToProps(state) {
  return {
    pageType: state.qt.pageType,
    subPageType: state.qt.subPageType,
    config: state.qt.config,
    data: state.qt.data,
    currentPath: state.qt.currentPath,
    title: state.qt.title || ""
  };
}

function mapDispatchToProps() {
  return {};
}

/**
 * IsomorphicComponent is used to render the main content of all isomorphic pages.
 * IsomorphicComponent is used during the {@link https://developers.quintype.com/malibu/isomorphic-rendering/server-side-architecture#render render} phase.
 * This component is not meant to be used directly, instead see {@link module:start.renderIsomorphicComponent renderIsomorphicComponent}
 *
 * @category Isomorphic
 * @module IsomorphicComponent
 */
exports.IsomorphicComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(IsomorphicComponentBase);

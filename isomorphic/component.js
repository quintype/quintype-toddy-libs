const React = require("react");
const {connect} = require("react-redux");

class IsomorphicComponentBase extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentPath != prevProps.currentPath) {
      window.scrollTo(0, 0);
    }

    if(this.props.title)
      global.document.title = this.props.title;
  }

  render() {
    const props = Object.assign({}, this.props, { key: this.props.currentPath || "" });
    return React.createElement(this.props.pickComponent(this.props.pageType), props);
  }
}

function mapStateToProps(state) {
  return {
    pageType: state.qt.pageType,
    config: state.qt.config,
    data: state.qt.data,
    currentPath: state.qt.currentPath,
    title: state.qt.title || ''
  }
}

function mapDispatchToProps() {
  return {};
}

exports.IsomorphicComponent = connect(mapStateToProps, mapDispatchToProps)(IsomorphicComponentBase);

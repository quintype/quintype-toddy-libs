const React = require("react");
const {connect} = require("react-redux");

function IsomorphicComponentBase(props) {
  return React.createElement(props.pickComponent(props.pageType), props)
}

function mapStateToProps(state) {
  return {
    pageType: state.qt.pageType,
    config: state.qt.config,
    data: state.qt.data
  }
}

function mapDispatchToProps() {
  return {};
}

exports.IsomorphicComponent = connect(mapStateToProps, mapDispatchToProps)(IsomorphicComponentBase);

const React = require("react");
const {connect} = require("react-redux");

function IsomorphicComponentBase(props) {
  return React.createElement(props.pickComponent(props.pageType), props)
}

function mapStateToProps(state) {
  return {
    pageType: state.pageType,
    config: state.config,
    data: state.data
  }
}

function mapDispatchToProps() {
  return {};
}

exports.IsomorphicComponent = connect(mapStateToProps, mapDispatchToProps)(IsomorphicComponentBase);

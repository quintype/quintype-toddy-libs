const React = require("react");
const { connect } = require("react-redux");

class TestComponent1Base extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <h1>This is the second test component to check loadable component</h1>
  }
}

function mapStateToProps(state) {
  return {
    pageType: state.qt.pageType,
    subPageType: state.qt.subPageType,
    config: state.qt.config,
    data: state.qt.data,
    currentPath: state.qt.currentPath,
    title: state.qt.title || "",
  };
}

function mapDispatchToProps() {
  return {};
}

exports.TestComponent1 = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestComponent1Base);

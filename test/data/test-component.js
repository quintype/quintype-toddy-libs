const React = require("react");
const { connect } = require("react-redux");

class TestComponentBase extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <h1>This is a test component to check loadable component</h1>;
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

exports.TestComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestComponentBase);

const TestComponent = () => {
  return (
    <div>
      <button type="button">Click me</button>
      <p>Hello</p>
    </div>
  );
};

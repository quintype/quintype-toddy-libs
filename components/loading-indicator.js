const React = require("react");
const {connect} = require("react-redux");

function LoadingIndicatorBase(props) {
  return <div className={`${props.clientLoading ? 'is-loading' : ''}`}>
    {props.clientLoading && props.children}
  </div>
}

function mapStateToProps(state) {
  return {
    clientLoading: state.clientLoading
  };
}

function mapDispatchToProps() {
  return {};
}

exports.LoadingIndicator = connect(mapStateToProps, mapDispatchToProps)(LoadingIndicatorBase);

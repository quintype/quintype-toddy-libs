const React = require("react");
const {connect} = require("react-redux");

function LoadingIndicatorBase(props) {
  return <div className={`${props.loading ? 'is-loading' : ''}`}>
    {props.loading && props.children}
  </div>
}

function mapStateToProps(state) {
  return {
    loading: state.pageLoading
  };
}

function mapDispatchToProps() {
  return {};
}

exports.LoadingIndicator = connect(mapStateToProps, mapDispatchToProps)(LoadingIndicatorBase);

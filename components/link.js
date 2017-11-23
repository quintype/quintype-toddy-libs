const React = require("react");
const {connect} = require("react-redux");
const _ = require("lodash");

function LinkBase(props) {
  return React.createElement("a", _(props)
    .omit("navigateTo")
    .merge({onClick: (e) => {e.preventDefault(); e.stopPropagation(); props.navigateTo(props.href)}})
    .value()
  );
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    navigateTo: function(url) {
      global.app.navigateToPage(dispatch, url);
    }
  };
}

exports.Link = connect(mapStateToProps, mapDispatchToProps)(LinkBase);

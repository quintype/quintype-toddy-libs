const React = require("react");
const {connect} = require("react-redux");

class ClientSideOnlyBase extends React.Component {
  render() {
    if (this.props.clientSideRendered) {
      return <div className="client-side-only client-side-only-client">{this.props.children}</div>;
    } else {
      return React.createElement(this.props.serverComponent || "div", {className: "client-side-only client-side-only-server"});
    }
  }
}

function mapStateToProps(state) {
  return {
    clientSideRendered: state.clientSideRendered
  }
}

function mapDispatchToProps(dispatch) {
  return {};
}

exports.ClientSideOnly = connect(mapStateToProps, mapDispatchToProps)(ClientSideOnlyBase);

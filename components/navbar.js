const React = require("react");
const {connect} = require("react-redux");

function NavbarBase(props) {
  return React.createElement(props.view, props)
}


function mapStateToProps(state, props) {
  return {
    menu: props.menu || [],
    title: props.title || '',
    data: state.data
  }
}

function mapDispatchToProps() {
  return {};
}

exports.Navbar = connect(mapStateToProps, mapDispatchToProps)(NavbarBase);

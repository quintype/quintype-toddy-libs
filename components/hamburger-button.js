const React = require('react');
const {connect} = require('react-redux');

const {HAMBURGER_CLICKED} = require("../store/actions");

function HamburgerButtonBase({onClick, children}) {
  return <a href="/" onClick={onClick}>{children}</a>;
}

function mapDispatchToProps(dispatch) {
  return {
    onClick: (e) => {
      e.stopPropagation();
      e.preventDefault();
      dispatch({type: HAMBURGER_CLICKED});
    }
  };
}

exports.HamburgerButton = connect(state => ({}), mapDispatchToProps)(HamburgerButtonBase);
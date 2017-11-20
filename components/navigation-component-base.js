const React = require("react");
const propTypes = require("prop-types");

class NavigationComponentBase extends React.Component {
  navigateTo(path) {
    global.navigateToPage(this.context.store.dispatch, path);
  }
}
NavigationComponentBase.contextTypes = {
  store: propTypes.object
};

module.exports = NavigationComponentBase;

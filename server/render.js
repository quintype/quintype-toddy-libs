const ReactDOMServer = require('react-dom/server');
const React = require("react");

const {Provider} = require("react-redux");

exports.renderReduxComponent = function renderReduxComponent(Component, store, props) {
  return ReactDOMServer.renderToString(
          React.createElement(Provider, {store: store},
            React.createElement(Component, props)));
}

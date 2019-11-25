/**
 * This namespace a helper method for render
 * ```javascript
 * import {renderReduxComponent} from "@quintype/framework/server/render";
 * ```
 * @category Server
 * @module render
 */

const ReactDOMServer = require("react-dom/server");
const React = require("react");

const { Provider } = require("react-redux");

/**
 * Render the given component in the redux store
 * @param {Component} Component The Component to render
 * @param {Redux} store The store to render
 * @param {Object} props The props to pass to the component
 */
exports.renderReduxComponent = function renderReduxComponent(
  Component,
  store,
  props
) {
  return ReactDOMServer.renderToString(
    React.createElement(
      Provider,
      { store },
      React.createElement(Component, props)
    )
  );
};

exports.renderReduxComponentWithStream = function renderReduxComponentWithStream(
  Component,
  store,
  props
) {
  return ReactDOMServer.renderToNodeStream(
    React.createElement(
      Provider,
      { store },
      React.createElement(Component, props)
    )
  );
};

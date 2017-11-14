const React = require('react');
const { connect } = require('react-redux');

class Polltype extends React.Component {

  componentDidMount() {
    this.loadPolltypeJS();
  }

  loadPolltypeJS() {
    const source = this.props.polltypeHost.replace(/^https:|^http:/i, '') + '/embed.js';
    if (!document.querySelector(`script[src="${source}"]`)) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = source;
      document.body.appendChild(script);
    }
  }

  render() {
    return (
      <div>
        <div data-polltype-embed-id={this.props.id} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { polltypeHost: state.qt.config["polltype-host"] };
}

module.exports = connect(mapStateToProps, {})(Polltype);
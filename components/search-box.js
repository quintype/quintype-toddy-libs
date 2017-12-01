const React = require('react');

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    this.props.onSubmitHandler(this.state.query);
  }

  render() {
    return <form role="search" action="/search" onSubmit={(e) => this.onSubmit(e)}>
      <input type="search"
            name="q"
            placeholder="Search for anything..."
            value={this.state.query}
            onChange={(e) => this.setState({query: e.target.value})}/>
    </form>
  }

}

module.exports = SearchBox;
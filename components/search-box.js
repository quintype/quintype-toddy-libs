const React = require('react');
const NavigationComponentBase = require("./navigation-component-base");

class SearchBox extends NavigationComponentBase {
  constructor(props) {
    super(props);
    this.state = {
      query: ""
    };
  }

  onSubmit(e) {
    e.preventDefault();
    if(this.state.query != "")
      this.navigateTo(`/search?q=${this.state.query}`)
    this.props.onSubmitHandler(this.state.query);
  }

  render() {
    return <form role="search" action="/search" onSubmit={(e) => this.onSubmit(e)} className={this.props.className}>
      <input type="search"
              name="q"
              placeholder={this.props.placeholder}
              value={this.state.query}
              onChange={(e) => this.setState({query: e.target.value})}/>
      {this.props.children}
    </form>
  }

}

module.exports = SearchBox;

const React = require('react');
const ReactDOM = require('react-dom');
const atob = require('atob');

function cloneScriptNode(node){
  var script  = document.createElement("script");
  script.text = node.innerHTML;
  for (var i = node.attributes.length-1; i >= 0; i--) {
    script.setAttribute(node.attributes[i].name, node.attributes[i].value);
  }
  return script;
}

function replaceScriptNodes(node) {
  if (node.tagName === 'SCRIPT') {
    node.parentNode.replaceChild(cloneScriptNode(node), node);
    if (window.instgrm) window.instgrm.Embeds.process(); //Temporary fix for instagram element on live blog page.
  } else {
    var i = 0;
    var children = node.childNodes;
    while ( i < children.length ) {
      replaceScriptNodes(children[i++]);
    }
  }
}

class JSEmbed extends React.Component {
  shouldComponentUpdate(nextProps) {
    return !(
      this.props.id === nextProps.id &&
      this.props.embedJS === nextProps.embedJS
    )
  }

  constructor(props) {
    super(props);

    this.uniqueId = 'anagh';
  }

  componentDidMount() {
    replaceScriptNodes(this.JSEmbed);
  }

  componentDidUpdate() {
    replaceScriptNodes(this.JSEmbed);
  }

  getEmbedJS() {
    var embedjs = this.props.embedJS;
    return embedjs != null ? atob(embedjs) : null;
  }

  render() {
    return <div ref={(jsembed) => { this.JSEmbed = jsembed; }} dangerouslySetInnerHTML={{__html: this.getEmbedJS()}} />
  }
}

module.exports = JSEmbed;

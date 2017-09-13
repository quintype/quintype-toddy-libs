const React = require("react");
const handleViewport = require("react-in-viewport").default;
const classNames = require("classnames");
const getYouTubeID = require('get-youtube-id');
const YouTube = require('react-youtube').default;
const SoundCloudPlayer = require('react-soundcloud-widget').default;
const JSEmbed = require('./story-elements/jsembed');
const { ResponsiveImage } = require("./responsive-image");
const { trackStoryElementAction, trackStoryElementView } = require("../utils/analytics");

function storyElementText(storyElement) {
  return React.createElement("div", {dangerouslySetInnerHTML: {__html: storyElement.text}});
}

function storyElementImage(storyElement) {
  return React.createElement("figure", {},
    React.createElement(ResponsiveImage, {
      slug: storyElement["image-s3-key"],
      metadata: storyElement["metadata"],
      aspectRatio: null,
      defaultWidth: 480,
      widths: [250,480,640],
      imgParams: {auto:['format', 'compress']}
    }),
    storyElement.title ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: storyElement.title}, className: "story-element-image-title"}) : undefined,
    storyElement.attribution ? React.createElement("figcaption", {dangerouslySetInnerHTML: {__html: storyElement.attribution}, className: "story-element-image-attribution"}) : undefined
  );
}

function storyElementTitle(storyElement) {
  return React.createElement("h2", {}, storyElement.text);
}

function storyElementSoundCloud(storyElement) {
  return React.createElement(SoundCloudPlayer, {url: storyElement.url });
}

function storyElementJsembed(storyElement) {
  return React.createElement(JSEmbed, {embedJS: storyElement['embed-js'], id: storyElement['id']});
}

function storyElementYoutube(storyElement) {
  const allProps = this.props;
  const opts = {
    playerVars: {
      autoplay: 0
    }
  };
  const playerEvents = {
    onPlay: function(){
      trackStoryElementAction(allProps, "play");
    },
    onPause: function(){
      trackStoryElementAction(allProps, "pause");
    },
    onEnd: function(){
      trackStoryElementAction(allProps, "complete");
    }
  }
  return React.createElement(YouTube, Object.assign({videoId: getYouTubeID(storyElement.url), opts:opts }, playerEvents));
}

// FIXME MISSING: composite, polltype
// TODO: Can also support various subtypes (though not needed potentially)
const DEFAULT_TEMPLATES = {
  "text": {render: storyElementText},
  "image": {render: storyElementImage},
  "title": {render: storyElementTitle},
  "youtube-video": {render: storyElementYoutube},
  "soundcloud-audio": {render: storyElementSoundCloud},
  "jsembed": {render: storyElementJsembed}
};

class StoryElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  template() {
    const storyElement = this.props.element;
    const templates = Object.assign({}, DEFAULT_TEMPLATES, this.props.templates);
    return Object.assign(
      {render: () => [], componentDidMount: () => true, componentWillUnmount: () => true},
      templates[storyElement.type],
      templates[storyElement.subtype]
    );
  }

  componentDidMount() {
    const componentDidMount = this.template().componentDidMount;
    if(componentDidMount)
      componentDidMount.call(this);
  }

  componentWillUnmount() {
    const componentWillUnmount = this.template().componentWillUnmount;
    if(componentWillUnmount)
      componentWillUnmount.call(this);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.inViewport && !this.state.elementViewedOnce) {
      this.setState({elementViewedOnce: true});
      trackStoryElementView(nextProps);
    }
  }

  storyElement() {
    return this.props.element;
  }

  render() {
    const storyElement = this.props.element;
    const typeClassName = `story-element-${storyElement.type}`;
    const subtypeClassName = `story-element-${storyElement.type}-${storyElement.subtype}`;

    return React.createElement("div", {
      className: classNames({
        "story-element-view": true,
        "story-element": true,
        [typeClassName]: true,
        [subtypeClassName]: !!storyElement.subtype
      }),
      'ref': this.props.innerRef,
    }, this.template().render.call(this, this.props.element, this.props.story))
  }
}

exports.StoryElement = handleViewport(StoryElement);
exports.STORY_ELEMENT_TEMPLATES = DEFAULT_TEMPLATES;

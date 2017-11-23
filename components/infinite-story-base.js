const React = require("react");

const { InfiniteScroll } = require("./infinite-scroll.js");

class InfiniteStoryBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moreItems: [],
      loading: false,
      pageNumber: 0,
      seenStoryIds: [props.data.story.id]
    }
  }

  allItems() {
    return [this.props.data].concat(this.state.moreItems);
  }

  removeDuplicates(items) {
    const existingStoryIds = this.allItems().map(item => item.story.id);
    return items.filter(item => !existingStoryIds.includes(item.story.id));
  }

  onFocus(index) {
    const item = this.allItems()[index];
    global.app.maybeSetUrl("/" + item.story.slug, item.story.headline);

    this.props.onItemFocus && this.props.onItemFocus(item, index);

    if(!this.state.seenStoryIds.includes(item.story.id)) {
      this.setState({seenStoryIds: this.state.seenStoryIds.concat([item.story.id])}, () => {
        this.props.onInitialItemFocus && this.props.onInitialItemFocus(item, index);
      })
    }
  }

  loadMore() {
    if(this.state.loading)
      return;
    const pageNumber = this.state.pageNumber;
    this.setState({loading: true, pageNumber: pageNumber + 1}, () => {
      this.props.loadItems(pageNumber).then((items) => {
        this.setState({
          loading: false,
          moreItems: this.state.moreItems.concat(this.removeDuplicates(items))
        })
      })
    })
  }

  render() {
    return <InfiniteScroll render={this.props.render}
                           items={this.allItems()}
                           loadNext={() => this.loadMore()}
                           loadMargin={this.props.loadMargin}
                           focusCallbackAt={this.props.focusCallbackAt || 20}
                           onFocus={(index) => this.onFocus(index)}/>
  }
}

exports.InfiniteStoryBase = InfiniteStoryBase;

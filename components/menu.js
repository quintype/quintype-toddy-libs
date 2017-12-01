const React = require("react");
const URL = require("url");
const { Link } = require("./link");
const {connect} = require("react-redux");

function MenuBase({children, className, itemClassName, items, currentUrl}) {
  return (
    <ul className={className}>
      {children}
      {items.map((item) => <MenuItem key={item['section-slug']}
                                     item={item}
                                     className={itemClassName}
                                     currentUrl={currentUrl}/>)}
    </ul>
  );
}

function mapStateToProps(state) {
  return {
    items: state.qt.config.layout.menu,
    currentUrl: state.qt.currentPath,
  }
}

const Menu = connect(mapStateToProps, () => ({}))(MenuBase);

function getRelativeUrl(url) {
  const {pathname, search, hash} = new URL.parse(url);
  return `${pathname}${search || ""}${hash || ""}`;
}

function getMenuItemBody(item, className, url, currentUrl) {
  switch(item['item-type']) {
    case 'section': return <Link href={url} className={className}>{item.title}</Link>
    default: return <a href={item.url} className={className}>{item.title}</a>;
  }
}

function MenuItem({item, className, currentUrl}) {
  const url = getRelativeUrl(item.url);
  return <li>{getMenuItemBody(item, `${className}${currentUrl == url ? " active": ""}`, url)}</li>;
}

module.exports = {Menu, MenuItem};
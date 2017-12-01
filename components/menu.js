const React = require("react");
const URL = require("url");
const { Link } = require("./link");

function Menu({children, className, itemClassName, items, currentUrl}) {
  return (
    <ul className={className}>
      {children}
      { items.map((item) => <MenuItem key={item['section-slug']} item={item} className={itemClassName} />) }
    </ul>
  );
}

function getRelativeUrl(url) {
  const {pathname, search, hash} = new URL.parse(url);
  return `${pathname}${search || ""}${hash || ""}`;
}

function getMenuItemBody(item, className) {
  switch(item['item-type']) {
    case 'section': return <Link href={getRelativeUrl(item.url)} className={className}>{item.title}</Link>
    default: return <a href={getRelativeUrl(item.url)} className={className}>{item.title}</a>;
  }
}

function MenuItem({item, className}) {
  return <li>{getMenuItemBody(item, className)}</li>;
}

module.exports = {Menu, MenuItem};
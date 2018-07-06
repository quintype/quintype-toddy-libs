// istanbul ignore file

const fs = require('fs');
const yaml = require('js-yaml');

function addLazyOptions(templateOptions) {
  const collectionLayouts = templateOptions["collection-layouts"].map(template => {
    return Object.assign({}, template, {
      options: (template.options || []).concat([
        {name: "lazy_load_images", type: "boolean"},
        {name: "client_side_only", type: "boolean"},
      ])
    })
  });
  return Object.assign({}, templateOptions, {"collection-layouts": collectionLayouts});
}

function readFile(fileName) {
  try {
    return yaml.load(fs.readFileSync(fileName))
  } catch(e) {
    return {"collection-layouts": []}
  }
}

module.exports = addLazyOptions(readFile("config/template-options.yml"));

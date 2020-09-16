const AmpOptimizer = require("@ampproject/toolbox-optimizer");

const ampOptimizer = AmpOptimizer.create({
  autoAddMandatoryTags: false,
  autoExtensionImport: false,
  preloadHeroImage: false,
});

async function optimize(ampHtml) {
  return ampOptimizer.transformHtml(ampHtml);
}

module.exports = { optimize };

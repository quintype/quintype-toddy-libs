const AmpOptimizer = require("@ampproject/toolbox-optimizer");
const { handleSpanInstance } = require("../../utils/apm");

const ampOptimizer = AmpOptimizer.create({
  autoAddMandatoryTags: false,
  autoExtensionImport: false,
  preloadHeroImage: false,
});

async function optimize(ampHtml) {
  const apmInstance = handleSpanInstance({ isStart: true, title: "optimize amp html" });
  const optimizedAmp = ampOptimizer.transformHtml(ampHtml);
  handleSpanInstance({ apmInstance });
  return optimizedAmp;
}

module.exports = { optimize };

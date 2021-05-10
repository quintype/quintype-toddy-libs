/*
 *  ************************************************************************
 *  *  © [2015 - 2020] Quintype Technologies India Private Limited
 *  *  All Rights Reserved.
 *  *************************************************************************
 */

const apm = require("elastic-apm-node");

const handleSpanInstance = ({ apmInstance, isStart, title }) => {
  if (isStart && !apmInstance) {
    const startSpan = apm.startSpan(title);
    return startSpan;
  }

  if (apmInstance) apmInstance.end();
  return true;
};

module.exports = {
  handleSpanInstance,
};

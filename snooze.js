const snooze = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
module.exports = { snooze };

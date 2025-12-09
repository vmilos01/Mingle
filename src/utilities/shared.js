
const { differenceInSeconds } = require("date-fns");

function secondsElapsedSince(time) {
  return Math.abs(differenceInSeconds(new Date(time), new Date()));
}

// compare by total reactions (likes + dislikes), descending
function sortByInterest(a, b) {
  const totalA = a.likes + a.dislikes;
  const totalB = b.likes + b.dislikes;
  return totalB - totalA;
}

module.exports = { secondsElapsedSince, sortByInterest };
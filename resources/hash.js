var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return String(Math.random() * (9000)).replace('.','');
};
module.exports = ID;
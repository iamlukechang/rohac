/**
 * Set up an watcher for a property in an object
 * @author iamlukechang@gmail.com (Luke Chang)
 */

/**
 * @param {object} obj 
 * @param {string} prop Name of the property need to be watched
 * @param {function} callback Function called on property changed
 */
function watch(obj, prop, callback) {
  if (typeof callback === 'undefined') {
    console.log('callback is not defined.');
    return;
  };

  var oldVal = obj[prop];

  delete obj[prop];
  Object.defineProperty(obj, prop, {
    get: function () {
      return oldVal;
    },
    set: function (newVal) {
      callback.call(obj, oldVal, newVal);
      return oldVal = newVal;
    }
  });
};

module.exports = watch;

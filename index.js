var crypto = require('crypto');

function stringifyOnce(obj, replacer, indent = 4) {
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value) {
        var printedObjIndex = false;
        printedObjects.forEach(function(obj, index) {
            if (obj === value) {
                printedObjIndex = index;
            }
        });

        if (
          !!key.match(/env/) ||
          !!key.match(/TMPDIR/) ||
          !!key.match(/SECURITYSESSIONID/) ||
          !!key.match(/TERM_SESSION_ID/) ||
          !!key.match(/children/) ||
          !!key.match(/_needImmediateCallback/) ||
          !!key.match(/pid/) ||
          !!key.match(/_bytesDispatched/) ||
          !!key.match(/core/) || // tries to convert Date object, issue with toISOString
          !!key.match(/_lastModified/) || // react/enzyme has effect on document
          !!key.match(/sync/) // stderr state
        ) {
          return;
        }
        if (key === '') { // root element
          printedObjects.push(obj);
          printedObjectKeys.push('root');
          return value;
        } else if (printedObjIndex + '' !== 'false' && typeof (value) === 'object') {
            if (printedObjectKeys[printedObjIndex] === 'root') {
                return '(pointer to root)';
            } else {
                return '(see ' + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase() : typeof (value)) + ' with key ' + printedObjectKeys[printedObjIndex] + ')';
            }
        } else {
            var qualifiedKey = key || '(empty key)';
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if (replacer) {
                return replacer(key, value);
            } else {
                return value;
            }
        }
    }

    return JSON.stringify(obj, printOnceReplacer, indent);
};

function writeHash() {
  var string = stringifyOnce(global);
  var hash = crypto.createHash('md5').update(string, 'utf8').digest('base64');

  return hash;
}

let hash = null;

beforeEach(function() {
  hash = writeHash();
});

afterEach(function() {
  if (writeHash() !== hash) {
    throw new Error('Global has changed');
  }
  hash = null;
});

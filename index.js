var path = require('path');
var fs;
try {
  fs = require('graceful-fs');
} catch (err) {
  fs = require('fs');
}

module.exports = read;

function read(filename, encoding, done) {
  filename = path.resolve(filename);
  if (typeof encoding === 'function' || !Buffer.isEncoding(encoding)) {
    done = encoding;
    encoding = 'utf8';
  }

  fs.stat(filename, function (err, stats) {
    if (err) return done(err);

    var cache = read.cache[filename];
    // only return the cached value if the mtime is exactly the same
    if (cache && cache.mtime.getTime() === stats.mtime.getTime())
      return done(null, cache.value);

    fs.readFile(filename, {'encoding':encoding}, function (err, body) {
      if (err) return done(err);

      cache = read.cache[filename] = {
        mtime: stats.mtime,
        value: body
      };
      done(null, body);
    });
  });

  return function (fn) {
    done = fn;
  };
}

read.clear = function () {
  read.cache = Object.create(null);
};

read.clear();

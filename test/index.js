var fs = require('fs');
var path = require('path');

var read = require('..');

var filename = path.join(__dirname, 'test.txt');
fs.writeFileSync(filename, 'asdf');

describe('fs read cache', function () {
  var mtime;

  it('should read a file with a hex', function (done) {
    read(filename, 'hex', function (err, body) {
      if (err) return done(err);

      var buf = new Buffer('asdf');
      body.should.equal(buf.toString('hex'));
      mtime = read.cache[filename].mtime;
      mtime.should.be.ok;
      read.cache[filename].value.should.equal(buf.toString('hex'));

      read.clear();
      done();
    });
  });

  it('should read a file', function (done) {
    read(filename, function (err, body) {
      if (err) return done(err);

      body.should.equal('asdf');
      mtime = read.cache[filename].mtime;
      mtime.should.be.ok;
      read.cache[filename].value.should.equal('asdf');

      done();
    });
  });

  it('should cache the file', function (done) {
    read.cache[filename].a = true;

    read(filename, function (err, body) {
      if (err) return done(err);

      body.should.equal('asdf');
      read.cache[filename].mtime.should.equal(mtime);
      read.cache[filename].value.should.equal('asdf');
      read.cache[filename].a = true;

      done();
    });
  });

  it('should wait a second', function (done) {
    setTimeout(done, 1001);
  });

  it('should skip the cache if the file is modified', function (done) {
    fs.writeFileSync(filename, 'asdfasdf');

    read(filename, function (err, body) {
      if (err) return done(err);

      body.should.equal('asdfasdf');
      read.cache[filename].mtime.should.not.equal(mtime);
      read.cache[filename].value.should.equal('asdfasdf');

      done();
    });
  });
});

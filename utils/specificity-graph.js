const log = require('fancy-log');
const through2 = require('through2'); // npm install --save through2
const specificityGraph = require('specificity-graph'); // npm install --save specificity-graph
const path = require('path');
const colors = require('ansi-colors');
const debug = require('debug')(path.parse(__filename).name); // show debug: DEBUG=*plugin-module-name* *node task*
const error = debug.extend('error');

// gulp wrapper for specificity-graph
module.exports = (opts = {}) =>
  through2.obj((file, encoding, done) => {
    const sg = 'specificity-graph';
    log(`${sg} processing:`, (colors.yellow(file.path)));
    opts.directory = opts.directory || sg;
    if (file.isNull() || file.isStream()) {
      done(error(`css file required, streams not supported`, file));
      return;
    }
    try {
      specificityGraph(
        opts.directory,
        file.contents.toString(),
        directory => {
          debug('files created in ' + directory);
        }
      );
    } catch (err) {
      this.emit('error', error(err, { fileName: file.path }));
    }

    done(
      log(`${sg} generated:`, opts.directory)
    );
  });

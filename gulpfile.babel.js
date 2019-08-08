'use strict';
/** Gulp Plugins */
import gulp from 'gulp';

//import html from './tasks/html';
import sass from './tasks/sass';
import icons from './tasks/icons';
import browser from './tasks/browser';
import watch from './tasks/watch';
import clean from './tasks/clean';

/**
 * root gulp file
 * debug: "node --inspect-brk ./node_modules/gulp/bin/gulp.js --verbose"
 * debug inspector URL: chrome://inspect
 */

gulp.task('sass', gulp.series(sass));

gulp.task('icons', gulp.series(icons));

// Build the "dist" folder by running all of the below tasks
// Sass must be run later so UnCSS can search for used classes in the others assets.
gulp.task('build', gulp.series(clean, gulp.series(icons, gulp.series(sass))));

// Build the site, run the server, and watch for file changes
gulp.task('serve', gulp.series('build', browser, watch));

gulp.task('default', cb => cb());

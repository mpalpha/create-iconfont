
/** Gulp Plugins */
import gulp from 'gulp';
import reload from './reload';

/** Yargs */
import yargs from 'yargs';

import pkg from '../package.json';

// default options
const fontName = yargs.argv['font-name'] || pkg.name;
const destinationPath = yargs.argv['destination-path'] || `./dist/${fontName}`;

// get command line arguements
const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;

/**
 * Watch for changes to static assets, pages, Sass, and JavaScript
 *
 * @task {watch}
 */
const watch = () => {
    let delay = { events: ["add", "change"], delay: 250 };
    gulp.watch(`assets/**/*`, delay).on('all', gulp.series('build', reload));
}

export default watch;
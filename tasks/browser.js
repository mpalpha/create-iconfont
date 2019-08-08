
/** BrowserSync */
import browserSync from 'browser-sync';
import htmlInjector from 'bs-html-injector';
import { config } from '../gulp.config';
/** Yargs */
import yargs from 'yargs';

import pkg from '../package.json';

// get command line arguements
const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;

// default options
const fontName = yargs.argv['font-name'] || pkg.name;
const destinationPath = yargs.argv['destination-path'] || `./dist/${fontName}`;

/**
 * Start a server with BrowserSync to preview the site in.
 *
 * @task {browser}
 */
const browser = (done) => {
    browserSync.use(htmlInjector, {
        // Files to watch that will trigger the injection
        files: `${destinationPath}/*.*`
    });
    browserSync.init({
        server: `${destinationPath}/`, port: config.PORT,
        plugins: ["bs-html-injector?files[]=*.html"]
    }, done);
}
export default browser;
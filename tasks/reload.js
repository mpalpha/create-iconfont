/** BrowserSync */
import browserSync from 'browser-sync';
/** Yargs */
import yargs from 'yargs';

// get command line arguements
const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;

/**
 * Start a server with BrowserSync to preview the site in.
 *
 * @task {browser}
 */
const reload = done => {
    browserSync.reload();
    done();
}

export default reload;
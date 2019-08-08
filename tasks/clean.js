/** Gulp Plugins */
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import { config } from '../gulp.config';
/** Del */
import del from 'del';
/** Yargs */
import yargs from 'yargs';

// get command line arguements
const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;

/**
 * Delete the "dist" folder
 * This happens every time a build starts 
 * 
 * @task {clean}
 */
const clean = cb => del(config.PATHS.dist, cb);

export default clean;
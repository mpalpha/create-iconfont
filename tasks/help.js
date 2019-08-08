'use strict';
/** Gulp Plugins */
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';

/**
 * help documentation
 */

/**
 * Load all Gulp plugins into one variable
 */
const $ = plugins({ lazy: true });

/**
 * Show Help
 * @task {help}
 * @group {default}
 * @order {0}
 */
export default gulp.task('init-help', () =>
  $.helpDoc(gulp, {
    lineWidth: 120,
    keysColumnWidth: 25,
    logger: $.util,
    displayDependencies: true,
    defaultGroupName: 'Development Tasks'
  })
);

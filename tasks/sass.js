/** Gulp Plugins */
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import { config } from '../gulp.config';
/** Specificity Graph */
import specificityGraph from '../utils/specificity-graph';
/** Stylesheet Audit */
import stylesheetAudit from '../utils/stylesheet-audit';
/** PostCss Purgecss */
import purgecss from '@fullhuman/postcss-purgecss';

//onst stylelintFormatter = require('stylelint-formatter-pretty');
/** Yargs */
import yargs from 'yargs';

import pkg from '../package.json';

const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;
const fixcss = yargs.argv.fixcss || false;
const report = yargs.argv.report || false;
const nolint = yargs.argv.nolint ? false : true;

// default options
const fontName = yargs.argv['font-name'] || pkg.name;
const destinationPath = yargs.argv['destination-path'] || `./dist/${fontName}`;

// load all Gulp plugins into one variable
const $ = plugins({ lazy: true });

/**
 * Compile base styles, autoprefix and generate src maps.
 *
 * @task {compileCss}
 * @group {styles}
 */
const compileCss = () =>
  gulp
    .src(`${destinationPath}/*.scss`)
    .pipe($.if(debugging, $.debug()))
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass({
        keepSpecialComments: 0
      }).on('error', function (err) {
        $.sass.logError.bind(this)(err);
        this.emit('end');
      })
    )
    .pipe($.autoprefixer('last 2 versions'))
    .pipe($.sourcemaps.write('/'))
    .pipe(gulp.dest(`${destinationPath}/`));

/**
 * Minify styles and generate src maps.
 *
 * @task {minifyCss}
 * @group {styles}
 */
const minifyCss = () =>
  gulp
    .src(`${destinationPath}/*.css`)
    .pipe($.if(debugging, $.debug()))
    .pipe($.sourcemaps.init({ loadMaps: true }))
    // repair files
    .pipe($.cssnano({ zindex: false, keepSpecialComments: 0 }))
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(debugging, $.sizediff.start()))
    .pipe(
      $.csso({
        sourceMap: true,
        restructure: false,
        debug: debugging
      })
    )
    .pipe(
      $.if(
        debugging,
        $.sizediff.stop({
          title: 'csso and purgecss:',
          formatFn: data => (
            'removed ' +
            ((data.diff / 1024).toFixed(2) + 'KB') +
            ' (' +
            Math.round(100 * data.compressionRatio) +
            '%)'
          )
        })
      )
    )
    .pipe($.sourcemaps.write('/'))
    .pipe(gulp.dest(`${destinationPath}/`));

/**
 * generate a css specificity graph.
 *
 * @task {specificity}
 * @group {styles}
 */
const specificity = () => gulp
  .src(`${destinationPath}/*.css`)
  // ignore framework
  .pipe($.stripCode({
    start_comment: "purgecss start ignore",
    end_comment: "purgecss end ignore"
  }))
  .pipe(specificityGraph({ directory: `${destinationPath}/stylesheet-metrics` }))
  .pipe(gulp.dest(`${destinationPath}/`));

/**
 * analyze css.
 *
 * @task {analyze}
 * @group {styles}
 */
const analyze = () => {
  return gulp
    .src(`${destinationPath}/*.css`)
    // ignore framework
    .pipe($.stripCode({
      start_comment: "purgecss start ignore",
      end_comment: "purgecss end ignore"
    }))
    // generate report
    .pipe(stylesheetAudit({
      file: `${destinationPath}/stylesheet-metrics/audit.html`,
      title: 'Stylesheet Audit'
    }))
}

/**
 * Watch our scss during development. Runs our builds our custom css and lints it only.
 *
 * @task {watch:sass}
 * @group {styles}
 */
const sass = report ? gulp.series(compileCss, minifyCss, gulp.parallel(specificity, analyze)) : gulp.series(compileCss, minifyCss);

//exports.compileCss = compileCss;
//exports.minifyCss = minifyCss;
export default sass;
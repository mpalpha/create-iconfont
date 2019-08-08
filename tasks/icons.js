'use strict';

import path from 'path';

/** Gulp Plugins */
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import { config } from '../gulp.config';
/** Yargs */
import yargs from 'yargs';

import pkg from '../package.json';

// get command line arguements
const debugging = yargs.argv.debug || false;
const force = yargs.argv.force || false;
const report = yargs.argv.report || false;

// load all Gulp plugins into one variable
const $ = plugins({ lazy: true });

// default options
const companyName = pkg.company || 'Company Name';
const fontName = yargs.argv['font-name'] || pkg.name;
const fontPath = yargs.argv['font-path'] || '';
const destinationPath = yargs.argv['destination-path'] || `./dist/${fontName}`;
const templatePath = yargs.argv['template-path'] || './assets/templates/';
const iconsPath = yargs.argv['icons-path'] || './assets/icons/';
const classPrefix = yargs.argv['class-prefix'] || 'icon';
const classSuffix = yargs.argv['class-suffix'] || fontName;

/**
 * Clean, compress and optimize svg icons.
 *
 * @task {minifyIcons}
 * @group {icons}
 */
const minifyIcons = () =>
  gulp
    .src(`${iconsPath}**/*.svg`)
    //.pipe($.newer(config.assets_config._icons_min))
    .pipe(
      $.if(
        debugging,
        $.debug({ title: `gulp-svgmin > "${iconsPath}**/*.svg":` })
      )
    )
    .pipe(
      $.svgmin({
        plugins: [
          {
            removeDoctype: false
          },
          {
            removeComments: false
          },
          {
            convertPathData: false
          },
          {
            cleanupNumericValues: {
              floatPrecision: 2
            }
          },
          {
            convertColors: {
              names2hex: false,
              rgb2hex: false
            }
          }
        ],
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe(gulp.dest(iconsPath));

/**
 * Main icon generator task.
 *
 * @task {buildIcons}
 * @group {icons}
 */
const buildIcons = () =>
  gulp
    .src(`${iconsPath}**/*.svg`)
    .pipe($.debug({ title: 'IconFont:' }))
    .pipe($.if(!force, $.newer(fontPath + fontName + '/icons.json')))
    .pipe($.if(debugging, $.debug({ title: `gulp-svgmin > ${fontName}:` })))
    .pipe(
      $.svgmin({
        plugins: [
          {
            removeDoctype: false
          },
          {
            removeComments: false
          },
          {
            convertPathData: false
          },
          {
            cleanupNumericValues: {
              floatPrecision: 2
            }
          },
          {
            convertColors: {
              names2hex: false,
              rgb2hex: false
            }
          }
        ],
        js2svg: {
          pretty: true
        }
      })
    )
    .pipe($.if(debugging, $.debug({ title: `gulp-iconfont > ${fontName}:` })))
    .pipe(
      $.iconfont({
        appendUnicode: false,
        normalize: true,
        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
        // recommended to get consistent builds when watching files
        timestamp: Math.round(Date.now() / 1000),
        fontName: fontName,
        fontHeight: 1792,
        descent: 50
      })
    )
    .on('glyphs', glyphs => {
      // build icons.json file
      $.debug({ title: 'filter icon glyphs:' });
      let glyphsFiltered = glyphs.map(glyph => ({
        id: glyph.name.replace(/\s/g, '-').toLowerCase(),
        name: glyph.name
          .replace(/-/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, m => m.toUpperCase()),
        unicode: glyph.unicode[0]
          .charCodeAt(0)
          .toString(16)
          .toLowerCase()
      }));

      $.if(
        !force,
        $.newer({
          dest: `${destinationPath}/`,
          ext: '.{svg|woff|woff2|eot|ttf}'
        })
      );

      $.debug({
        title: `generate icons json file > ${destinationPath}/icons.json`
      });
      $.file(
        // generate icons json file
        'icons.json',
        JSON.stringify({ icons: glyphsFiltered }, null, 4)
      ).pipe(gulp.dest(`${destinationPath}/`));

      // generate icons sass file
      gulp
        .src(`${templatePath}_icons.scss`)
        .pipe(
          $.debug({
            title: `read sass template file > ${templatePath}_icons.scss:`
          })
        )
        .pipe($.if(!force, $.newer(`${destinationPath}/${fontName}.scss`)))
        .pipe(
          $.consolidate('lodash', {
            glyphs: glyphsFiltered,
            timeStamp: Math.round(Date.now() / 1000),
            fontName: fontName,
            glyphsSassMap:
              '(\n  ' +
              glyphsFiltered
                .map(glyph => glyph.id + ': "' + glyph.unicode + '"')
                .join(',\n  ') +
              '\n)',
            // set path to font (from your CSS file if relative)
            fontPath: fontPath,
            classPrefix: classPrefix, // set class name prefix in your CSS
            classSuffix: classSuffix // set class name suffix in your CSS
          })
        )
        // rename icons sass file
        .pipe($.rename(fontName + '.scss'))
        .pipe(
          $.debug({
            title: `write sass file > $${destinationPath}/${fontName}.scss:`
          })
        )
        // set path to export your CSS
        .pipe(gulp.dest(`${destinationPath}/`));

      // generate icons html demo file
      gulp
        .src(`${templatePath}index.html`)
        .pipe(
          $.debug({
            title: `read html template file > ${templatePath}/index.html:`
          })
        )
        .pipe(
          $.consolidate('lodash', {
            glyphs: glyphs,
            glyphsFiltered: glyphsFiltered,
            timeStamp: Math.round(Date.now() / 1000),
            fontName: fontName,
            fontPath: fontPath,
            companyName: companyName,
            classPrefix: classPrefix, // set class name prefix in your CSS
            classSuffix: classSuffix, // set class name suffix in your CSS
            report: report,
            destinationPath: destinationPath
          })
        )
        .pipe(
          $.debug({ title: `write html file > ${templatePath}/index.html:` })
        )
        .pipe(gulp.dest(destinationPath + '/'));
    })
    .pipe(gulp.dest(destinationPath + '/'));

/**
 * Generate Icons.
 *
 * @task {icons}
 * @group {icons}
 */
const icons = gulp.series(buildIcons);
export default icons;

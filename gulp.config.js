/**
 * This file/module contains all configuration for the gulp build process.
 */

/*jshint camelcase: false */

'use strict';

const debugging = require('yargs').argv.debug || false;
const fs = require('fs');

/**
 * Exports our gulpjs configs.
 */
const config = () => {

  /**
   * Return our config const for use throughout our gulp workflow.
   */
  const config = {
    PORT: 8000,
    COMPATIBILITY: [
      "last 2 versions",
      "ie >= 9",
      "ios >= 7"
    ],
    UNCSS_OPTIONS: {
      html: [
        "dist/**/*.html"
      ],
      ignore: [
        null,
        null
      ]
    },
    PATHS: {
      dist: "dist",
      assets: [
        "src/assets/**/*",
        "!src/assets/{images,js,scss}/**/*"
      ],
      sass: [
        "node_modules/foundation-sites/scss",
        "node_modules/motion-ui/src"
      ],
      entries: [
        "src/assets/js/app.js"
      ]
    }
  };

  return config;
};

exports.config = config();
'use strict';
const path = require('path');
const debug = require('debug')(path.parse(__filename).name); // show debug: DEBUG=*plugin-module-name* *node task*
const error = debug.extend('error');
const log = require('fancy-log');
const colors = require('ansi-colors');
const format = require('dateformat');
const through2 = require('through2');
const Parker = require('parker');
const marked = require('marked');
const fs = require('fs');

module.exports = function (opts) {

	const sr = 'stylesheet-audit';
	const htmlStart = `<!DOCTYPE html>
	<html>
	  <head>
		<meta charset="UTF-8"/>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
		<title>Stylesheet Audit</title>
		<style>
		/* micro css framework */
		:root{--font:Arial, "Helvetica Neue", Helvetica, sans-serif;--primary-color:#07F;--light:#eee;--margin:1rem}
		*{box-sizing:border-box}
		.c,body,input,.input,pre,td,th,ul{padding:1em}
		td,th{text-align:left;border-bottom:solid var(--light)}
		.c,body{max-width:60em;margin:auto;font:1em/1.6 var(--font)}
		.row,pre{overflow:auto}
		.row{margin-left:calc(var(--margin) / 2 * -1);margin-right:calc(var(--margin) / 2 * -1)}
		.c,body,.col,.w-100{width:100%}
		.input,pre{border:1px solid var(--light);margin:0 0 var(--margin)}
		h1{font:1 2.5em var(--font)}
		h2{font:1 2.2em var(--font)}
		h3{font:1 1.9em var(--font)}
		h4{font:1 1.6em var(--font)}
		h5{font:1 1.3em var(--font)}
		h6,.btn{font:1 1em var(--font)}
		h1,h2,h3,h4,h5,h6{margin:.4em 0}
		ul {list-style-type:none;padding:0%}
		ul ul {padding-bottom:0.5em;padding-left:0.5em}
		ul ul>li::before {content:'. '}
		a{color:var(--primary-color);text-decoration:unset}
		.btn.primary{color:#fff;background:var(--primary-color);border:unset}
		.btn:hover{transform:scale(1.05)}
		.btn{padding:1em 1.3em;transition:.2s;letter-spacing:.1em;text-transform:uppercase;background:unset;border:2px solid;font-size:.8em;margin:0 0 1em}
		a:hover, a:focus{opacity:.6}
		.input:focus,hr{border: 1px solid var(--primary-color);outline:0}
		@media screen and (min-width: 40em) {
		.col{float:left;margin:calc(var(--margin) / 2)}
		.one.col{width:calc(100% * 1 / 12 - var(--margin))}
		.two.col{width:calc(100% * 2 / 12 - var(--margin))}
		.three.col{width:calc(100% * 3 / 12 - var(--margin))}
		.four.col{width:calc(100% * 4 / 12 - var(--margin))}
		.five.col{width:calc(100% * 5 / 12 - var(--margin))}
		.six.col{width:calc(100% * 6 / 12 - var(--margin))}
		.seven.col{width:calc(100% * 7 / 12 - var(--margin))}
		.eight.col{width:calc(100% * 8 / 12 - var(--margin))}
		.nine.col{width:calc(100% * 9 / 12 - var(--margin))}
		.ten.col{width:calc(100% * 10 / 12 - var(--margin))}
		.eleven.col{width:calc(100% * 11 / 12 - var(--margin))}
		.twelve.col{width:calc(100% * 12 / 12 - var(--margin))}
		}
		@media screen and (min-width: 40em) {
		.one-medium.col{width:calc(100% * 1 / 12 - var(--margin))}
		.two-medium.col{width:calc(100% * 2 / 12 - var(--margin))}
		.three-medium.col{width:calc(100% * 3 / 12 - var(--margin))}
		.four-medium.col{width:calc(100% * 4 / 12 - var(--margin))}
		.five-medium.col{width:calc(100% * 5 / 12 - var(--margin))}
		.six-medium.col{width:calc(100% * 6 / 12 - var(--margin))}
		.seven-medium.col{width:calc(100% * 7 / 12 - var(--margin))}
		.eight-medium.col{width:calc(100% * 8 / 12 - var(--margin))}
		.nine-medium.col{width:calc(100% * 9 / 12 - var(--margin))}
		.ten-medium.col{width:calc(100% * 10 / 12 - var(--margin))}
		.eleven-medium.col{width:calc(100% * 11 / 12 - var(--margin))}
		.twelve-medium.col{width:calc(100% * 12 / 12 - var(--margin))}
		}
		@media screen and (min-width: 64em) {
		.one-large.col{width:calc(100% * 1 / 12 - var(--margin))}
		.two-large.col{width:calc(100% * 2 / 12 - var(--margin))}
		.three-large.col{width:calc(100% * 3 / 12 - var(--margin))}
		.four-large.col{width:calc(100% * 4 / 12 - var(--margin))}
		.five-large.col{width:calc(100% * 5 / 12 - var(--margin))}
		.six-large.col{width:calc(100% * 6 / 12 - var(--margin))}
		.seven-large.col{width:calc(100% * 7 / 12 - var(--margin))}
		.eight-large.col{width:calc(100% * 8 / 12 - var(--margin))}
		.nine-large.col{width:calc(100% * 9 / 12 - var(--margin))}
		.ten-large.col{width:calc(100% * 10 / 12 - var(--margin))}
		.eleven-large.col{width:calc(100% * 11 / 12 - var(--margin))}
		.twelve-large.col{width:calc(100% * 12 / 12 - var(--margin))}
		}
		</style>
		</head>
	  
		<body>
			<div class="example-grid">
				<div class="row">
					<div class="twelve col">`;
	const htmlEnd = `
					</div>
				</div>
			</div>
			<script>
			  function swatches() {
				var elements = document.querySelectorAll("*");
				return [].filter
				  .call(elements, function(element) {
					return !element.firstElementChild && RegExp(/#([A-Fa-f0-9]{6})/).test(element.innerText);
				  })
				  .forEach(function(el) {
					var swatch = document.createElement("span");
					swatch.style.backgroundColor = el.innerText;
					swatch.style.display = "inline-block";
					swatch.style.marginLeft = "1em";
					swatch.style.verticalAlign = "middle";
					swatch.style.height = "1em";
					swatch.style.width = "1em";
					swatch.style.border = "1px solid rgba(0,0,0,0.1)";
					el.after(swatch);
				  });
			  }
			 swatches();
			</script>
		</body>
	  </html>`;

	var oDefaultOptions;

	oDefaultOptions = {
		metrics: false,
		file: false,
		title: false
	};


	opts = opts || oDefaultOptions;

	return through2.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(error(sr, 'Streaming not supported'));
			return;
		}

		var kindOf, kindsOf, metrics, aLogFileLines, aMetrics, oMetric, oParsedMetrics, parker, sDefaultTitle, sMetric, sTitle;

		kindsOf = {};

		"Number String Boolean Function RegExp Array Date Error".split(" ").forEach(function (k) {
			return kindsOf["[object " + k + "]"] = k.toLowerCase();
		});

		kindOf = function (value) {
			if (value == null) {
				return String(value);
			}
			return kindsOf[kindsOf.toString.call(value)] || "object";
		};

		var fileOpts = Object.assign(oDefaultOptions, opts);

		try {

			var relativeOutputFilePath = path.relative(path.resolve(path.join(__dirname, '..')), path.resolve(fileOpts.file));
			var relativeFilePath = path.relative(path.resolve(path.join(__dirname, '..')), path.resolve(file.path));
			aLogFileLines = [];
			sDefaultTitle = "Stylesheet Report";

			if (Array.isArray(fileOpts.metrics)) {
				aMetrics = (function () {
					var _results = [];
					for (var i = 0; i < fileOpts.metrics.length; i++) {
						sMetric = fileOpts.metrics[i];
						_results.push(require("parker/metrics/" + sMetric + ".js"));
					}
					return _results;
				})();
			} else {
				aMetrics = require("parker/metrics/All.js");
			}

			parker = new Parker(aMetrics);
			oParsedMetrics = {};
			for (var i = 0; i < aMetrics.length; i++) {
				oMetric = aMetrics[i];
				oParsedMetrics[oMetric.id] = oMetric;
			}

			if (fileOpts.file) {
				if (!fs.existsSync(fileOpts.file)) {
					if (sTitle = fileOpts.title || sDefaultTitle) {
						aLogFileLines.push("# " + sTitle);
						aLogFileLines.push("");
						if (sTitle !== sDefaultTitle) {
							aLogFileLines.push("## Generated From:");
						}
					} else {
						aLogFileLines.push("# " + sDefaultTitle);
					}
				}
				aLogFileLines.push(`<hr></hr>`);
				aLogFileLines.push("");
			}

			var aFileResults, aResult, aResults, mValue, oParkerMetrics, sResult, sValue;
			aResults = [];
			aFileResults = [];
			oParkerMetrics = parker.run(file.contents.toString());
			if (oParkerMetrics) {
				for (sMetric in oParkerMetrics) {
					mValue = oParkerMetrics[sMetric];
					aResults.push([oParsedMetrics[sMetric].name, mValue]);
				}
				if (aResults.length) {
					log(`${sr} processing:`, (colors.yellow(file.path)));
					for (var j = 0; j < aResults.length; j++) {
						aResult = aResults[j];
						sValue = (function () {
							switch (kindOf(aResult[1])) {
								case "array":
									debug(colors.cyan("" + aResult[0] + ":"));
									for (var k = 0; k < aResult[1].length; k++) {
										sResult = aResult[1][k];
										debug("\t" + sResult);
									}
									aFileResults.push("- **" + aResult[0] + ":**");
									var _results = [];
									for (var l = 0; l < aResult[1].length; l++) {
										sResult = aResult[1][l];
										if (sResult.substring(0, 1) === "#") {
											sResult = "`" + sResult + "`";
										}
										_results.push(aFileResults.push("\t- " + sResult));
									}
									return _results;
									break;
								case "number":
									debug(colors.cyan("" + aResult[0] + ":"), colors.yellow(aResult[1]));
									return aFileResults.push("- **" + aResult[0] + ":** " + aResult[1]);
								default:
									debug(colors.cyan("" + aResult[0] + ":"), aResult[1]);
									return aFileResults.push("- **" + aResult[0] + ":** " + aResult[1]);
							}
						})();
					}
				}
				if (fileOpts.file && aFileResults.length) {
					aLogFileLines.push("### " + relativeFilePath);
					aLogFileLines.push("");
					aLogFileLines = aLogFileLines.concat(aFileResults);
				}
			}
			if (fileOpts.file) {
				aLogFileLines.push("");
				aLogFileLines.push("* * *");
				aLogFileLines.push("");
				aLogFileLines.push("Last generated: " + (format(new Date(), 'dddd, mmmm dS, yyyy, h:MM:ss TT')));
				aLogFileLines.push("");
				fs.writeFile(fileOpts.file, htmlStart + marked(aLogFileLines.join("\n")) + htmlEnd, () => { });
				log(`${sr} generated:`, relativeOutputFilePath);
			}
			this.push(aResults);
		} catch (err) {
			this.emit('error', error(sr, err, { fileName: file.path }));
		}

		cb();
	});
};
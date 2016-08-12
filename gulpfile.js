// Include Global Dependancies
fs        = require('fs'),
path      = require('path');

// Include GULP Plugins
gulp      = require('gulp'),
gutil     = require('gulp-util'),
sass      = require('gulp-sass'),
jshint    = require('gulp-jshint'),
uglify    = require('gulp-uglify'),
rename    = require('gulp-rename'),
plumber   = require('gulp-plumber'),
webpack  	= require('gulp-webpack');
BowerWebpackPlugin = require('bower-webpack-plugin');

// Include Application Configuration File
config = JSON.parse(fs.readFileSync('config.json'));

// Compiles CSS From SCSS Files In Specified Directories
gulp.task('compile-sass', () => {

	// Itterate Through Directories Listed In Config File & Compile SCSS Files Held Within Them
	for(i = 0; i < Object.keys(config.gulp.watched.css).length; i++) {

		return gulp.src(path.join(__dirname,  'public/'+config.gulp.watched.css[i]+'*.scss'))
				.pipe(sass().on('error', sass.logError))
				.pipe(gulp.dest(path.join(__dirname, 'public/'+config.gulp.watched.css[i])));
	}
});

/**
 * Use webpack to compile javascript into bundle.js file
 */
gulp.task('webpack', () => {

		return webpack({
			entry: {
				main: path.join(__dirname, 'public/js/core/main.js')
			},
			output: {
				filename: 'bundle.js'
			},

      plugins: [
          new BowerWebpackPlugin({
          modulesDirectories: ["bower_components"],
          manifestFiles:      "bower.json",
          includes:           /.*/,
          excludes:           [],
          searchResolveModulesDirectories: true
        })
    	]
		}, require('webpack'))
			.pipe(gulp.dest(path.join(__dirname, 'public/js/')));
});

/**
 * Minifies Javascript files in the public/js directory
 */
gulp.task('minify-js', () => {

	// Loop throught the directory and return the filename of each file held within
	fs.readdirSync(path.join(__dirname, 'public/js/')).forEach(function(filename) {

		// Check If The File Has The Js Extension
		if(~filename.indexOf('.js')) {

			// Explode The File Name
			var name = filename.split(".").map(function(val) {
				return val;
			});

			gulp.src(path.join(__dirname, 'public/js/*.js'))
				.pipe(plumber())
				.pipe(jshint())
  					.pipe(jshint.reporter('jshint-stylish'))
				.pipe(uglify())
				.pipe(rename({
					basename: name[0],
					extname: '.min.js'
				}))
				.pipe(gulp.dest(path.join(__dirname, 'public/js/dist/')));
		}
	});

	// Itterate Through Directories Listed In Config File & Minify Js Files Held Within Them
	for(i = 0; i < Object.keys(config.gulp.watched.js).length; i++) {

		// Loop throught the directory and return the filename of each file held within
		fs.readdirSync(path.join(__dirname, 'public/js/'+config.gulp.watched.js[i])).forEach(function(filename) {

			// Check If The File Has The Js Extension
			if(~filename.indexOf('.js')) {

				// Explode The File Name
				var name = filename.split(".").map(function(val) {
					return val;
				});

				gulp.src(path.join(__dirname, 'public/js/'+config.gulp.watched.js[i]+filename))
					.pipe(plumber())
					.pipe(jshint())
    					.pipe(jshint.reporter('jshint-stylish'))
					.pipe(uglify())
					.pipe(rename({
						basename: name[0],
						extname: '.min.js'
					}))
					.pipe(gulp.dest(path.join(__dirname, 'public/js/dist/'+config.gulp.watched.js[i])));
			}
		});
	}
});

gulp.task('watch', () => {

	gulp.watch(path.join(__dirname, 'public/js/core/main.js'), ['webpack']);
  for(i = 0; i < Object.keys(config.gulp.watched.js).length; i++) {
    fs.readdirSync(path.join(__dirname, 'public/js/'+config.gulp.watched.js[i])).forEach((filename) => {

      gulp.watch(path.join(__dirname, 'public/js/'+config.gulp.watched.js[i]+'*.js'), ['webpack']);
    });
  }

  gulp.watch(path.join(__dirname, 'public/css/*.scss'), ['compile-sass']);
	for(i = 0; i < Object.keys(config.gulp.watched.css).length; i++) {

		fs.readdirSync(path.join(__dirname, 'public/'+config.gulp.watched.css[i])).forEach((filename) => {

			gulp.watch(path.join(__dirname, 'public/'+config.gulp.watched.css[i]+'*.scss'), ['compile-sass']);
		});
	}

});

gulp.task('default', ['watch']);

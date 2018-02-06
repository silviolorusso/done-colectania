/* File: gulpfile.js */

var gulp  			= require('gulp'),
    gutil 			= require('gulp-util');
    plumber 		= require('gulp-plumber');
    sass  			= require('gulp-sass');
    sourcemaps 	= require('gulp-sourcemaps');
    concat      = require('gulp-concat');
    pug					= require('gulp-pug');

gulp.task('build-css', function() {
return gulp.src('source/scss/**/*.scss')
    .pipe(sourcemaps.init())  // Process the original sources
    	.pipe(plumber())
      .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest('public/assets/css'))
});

gulp.task('build-js', function() {
  return gulp.src('source/js/**/*.js')
    .pipe(sourcemaps.init())
      // .pipe(concat('main.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/assets/js'));
});

gulp.task('build-interface-js', function() {
  return gulp.src('source/interface-js/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(concat('interface-js.js'))
      //only uglify if gulp is ran with '--type production'
      .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/assets/js'));
});

gulp.task('build-html', function() {
  return gulp.src('source/views/*.pug')
			.pipe(plumber())
      .pipe(pug({
    		doctype: 'html',
    		pretty: false
 			}))
    .pipe(gulp.dest('public'));
});

gulp.task('default', ['watch']);

gulp.task('watch', function() {
  gulp.watch('source/scss/**/*.scss', ['build-css']);
  gulp.watch('source/js/**/*.js', ['build-js']);
  gulp.watch('source/interface-js/**/*.js', ['build-interface-js']);
  gulp.watch('source/views/**/*.pug', ['build-html']);
});

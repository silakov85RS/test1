'use strict';

var gulp            = require('gulp');
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var autoprefixer    = require('gulp-autoprefixer');
var pug             = require('gulp-pug');
var fs              = require('file-system');
var imagemin        = require('gulp-imagemin');
var browserSync     = require('browser-sync');
var svgSprite       = require('gulp-svg-sprites');

var src = {
  pug: 'src/pug/',
  img: 'src/assets/',
  sass: 'src/scss/',
  fonts: 'src/assets/fonts/*.*',
  js: 'src/js/*.js',
};

var dev = {
  html: 'dev/',
  img: 'dev/assets/img/',
  css: 'dev/css',
  fonts: 'dev/assets/fonts/',
  js: 'dev/js/',
};

var pages = {
  html: 'pages/',
  img: 'pages/assets/img/',
  css: 'pages/css',
  fonts: 'pages/assets/fonts/',
  js: 'pages/js/',
};

gulp.task('sprites', function () {
  return gulp
    .src(src.img + 'svg/**/*.svg')
    .pipe(svgSprite({
      mode: 'symbols',
      preview: false,
      svg: {
        symbols: 'sprite.svg'
      }
    }))
    .pipe(gulp.dest(src.img));
});

gulp.task('sass', function () {
  return gulp
    .src(src.sass + '*.scss' )
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 version'],
      cascade: false,
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dev.css))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('pug', ['sprites'], function () {
  return gulp
    .src(src.pug + '*.pug')
    .pipe(pug({
      pretty: true,
      locals: Object.assign(JSON.parse(fs.readFileSync('project-content.json'))),
    }).on('error', (e) => console.log(e.toString())))
    .pipe(gulp.dest(dev.html))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('copy-fonts', function () {
  return gulp
    .src(src.fonts)
    .pipe(gulp.dest(dev.fonts));
});

gulp.task('copy-img', function () {
  return gulp
    .src(src.img + 'img/**/*.*')
    .pipe(gulp.dest(dev.img));
});

gulp.task('watch', function () {
  gulp.watch(src.img + 'svg/**/*.svg', ['sprites']);
  gulp.watch(src.pug + '**/*.pug', ['pug']);
  gulp.watch(src.sass + '**/*.scss', ['sass']);
  gulp.watch(src.img + 'img/**/*.*', ['copy-img']);
});

gulp.task('browserSync', function () {
  browserSync({
    server: {
      baseDir: 'dev/',
      index: 'index.html',
    },
    port: 8080,
    open: true,
    notify: false,
  });
});

gulp.task('default', [
  'sass',
  'pug',
  'copy-img',
  'copy-fonts',
  'watch',
], function () {
  return gulp.start('browserSync');
});

gulp.task('css', function () {
  return gulp
    .src(src.sass + '*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 version'],
      cascade: false,
    }))
    .pipe(gulp.dest(pages.css));
});

gulp.task('html', ['sprites'], function () {
  return gulp
    .src(src.pug + '*.pug')
    .pipe(pug({
      pretty: true,
      locals: Object.assign(JSON.parse(fs.readFileSync('project-content.json'))),
    }))
    .pipe(gulp.dest(pages.html));
});

gulp.task('copy-fonts-pages', function () {
  return gulp
    .src(src.fonts)
    .pipe(gulp.dest(pages.fonts));
});

gulp.task('imagemin', function () {
  return gulp
    .src(src.img + 'img/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest(pages.img));
});

gulp.task('build', [
  'css',
  'html',
  'imagemin',
  'copy-fonts-pages'
], function () {});

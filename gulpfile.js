var gulp        = require('gulp');
var concat      = require('gulp-concat');
var ngAnnotate  = require('gulp-ng-annotate');
var tap         = require('gulp-tap');
var sourcemaps  = require('gulp-sourcemaps');

var path_js = [
      'node_modules/angular/angular.js'
    , 'node_modules/angular-ui-router/release/angular-ui-router.js'
    , 'mgosites-admin/AdminApp/*.js'
    , 'mgosites-admin/AdminPanel/*.js'
    , 'mgosites-admin/AdminUI/*.js'
    , '!mgosites-admin/build/*.js'
];

gulp.task('build:js', function() {
    gulp.src(path_js)
        //.pipe(ngAnnotate())
        .pipe(sourcemaps.init( /* { loadMaps: true } */ ))
        .pipe(concat('app.js', {newLine: '\n;'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('mgosites-admin/build'))
        .on('end', function () {
            console.log('[' + new Date + '] js compiled')
        })
});


gulp.task('watch', ['build:js'], function () {
    gulp.watch(['mgosites-admin/**/*.js', '!mgosites-admin/build/*.js'], {interval: 1000}, ['build:js']);
});

gulp.task('default', ['build:js']);
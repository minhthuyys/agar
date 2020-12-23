var gulp = require('gulp');
var babel = require('gulp-babel');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var mocha = require('gulp-mocha');
var todo = require('gulp-todo');
var webpack = require('webpack-stream');
var fs = require('fs');

function test () {
  return gulp.src(['test/**/*.js'])
      .pipe(mocha());
}

function lint () {
  return gulp.src(['**/*.js', '!node_modules/**/*.js', '!bin/**/*.js'])
    .pipe(jshint({
          esnext: true
      }))
    .pipe(jshint.reporter('default', { verbose: true}))
    .pipe(jshint.reporter('fail'));
}

function build_client () {
  return gulp.src(['src/client/js/app.js'])
    .pipe(uglify())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(babel({
      presets: [
        ['es2015', { 'modules': false }]
      ]
    }))
    .pipe(gulp.dest('bin/client/js/'));
}

function move_client() {
  return gulp.src(['src/client/**/*.*', '!client/js/*.js'])
    .pipe(gulp.dest('./bin/client/'));
}

function build_server() {
    return gulp.src(['src/server/**/*.*', 'src/server/**/*.js'])
      .pipe(babel())
      .pipe(gulp.dest('bin/server/'));
}

function watch () {
  gulp.watch(['src/client/**/*.*'], ['build-client', 'move-client']);
  gulp.watch(['src/server/*.*', 'src/server/**/*.js'], ['build-server']);
  return gulp.start(run_only);
}

function todofc() {
    return gulp.src('src/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
}

function run () {
  return nodemon({
      delay: 10,
      script: './server/server.js',
      cwd: "./bin/",
      args: ["config.json"],
      ext: 'html js css'
  })
  .on('restart', function () {
      util.log('server restarted!');
  });
}

function run_only() {
  return nodemon({
    delay: 10,
    script: './server/server.js',
    cwd: "./bin/",
    args: ["config.json"],
    ext: 'html js css'
})
.on('restart', function () {
    util.log('server restarted!');
});
}

gulp.task('build', gulp.series(build_client, build_server, test));

gulp.task('test', gulp.series(lint,test));

gulp.task(gulp.series(lint));

gulp.task('build-client', gulp.series(lint, move_client, build_client));

gulp.task(gulp.series(move_client));

gulp.task('build-server', gulp.series(lint, build_server));

gulp.task('watch', gulp.series('build', watch));

gulp.task('todo', gulp.series(lint,todofc));

gulp.task('run', gulp.series('build', run));

gulp.task('default', gulp.series('run'));

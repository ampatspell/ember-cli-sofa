var gulp = require('gulp');
var handlebars = require('gulp-compile-handlebars');
var less = require('gulp-less');
var rename = require('gulp-rename');
var markdown = require('./doc/lib/gulp-markdown');
var exec = require('child_process').exec
var path = require('path');

var dist = 'tmp/doc';

gulp.task('doc:less', function() {
  return gulp.src('doc/style/main.less')
    .pipe(less().on('error', function (err) {
      console.log("×", err.message);
      this.emit('end');
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(dist));
});

gulp.task('doc:handlebars', function() {
  return gulp.src('doc/index.hbs')
  .pipe(markdown({
    readme: 'README.md',
    changes: 'CHANGES.md',
    todo: 'TODO.md'
  }))
  .pipe(handlebars({}, {
    batch: ['doc/partials'],
    helpers: require('./doc/lib/helpers')(handlebars.Handlebars)
  }))
  .pipe(rename({ extname: '.html' }))
  .pipe(gulp.dest(dist));
});

gulp.task('doc:browse', function() {
  exec('open ' + path.resolve(__dirname, dist + '/index.html'));
});

gulp.task('doc', ['doc:less', 'doc:handlebars']);

gulp.task('doc:watch', ['doc', 'doc:browse'], function() {
  gulp.watch('doc/**/*.less', ['doc:less']);
  gulp.watch('doc/**/*.hbs', ['doc:handlebars']);
  gulp.watch('README.md', ['doc:handlebars']);
  gulp.watch('CHANGES.md', ['doc:handlebars']);
  gulp.watch('TODO.md', ['doc:handlebars']);
});

gulp.task('doc:deploy', ['doc'], function(cb) {
  var source = path.resolve(__dirname, dist);
  var target = "server:/home/ampatspell/projects/sofa";
  exec("rsync -rtvz --delete --stats --exclude '.DS_Store' " + source + "/* " + target, function(err, stdout, stderr) {
    if(stdout) {
      console.log(stdout);
    }
    if(stderr) {
      console.log(stderr);
    }
    cb(err);
  });
});

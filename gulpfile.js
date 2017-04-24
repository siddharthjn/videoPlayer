var gulp = require('gulp');
var uglify = require('gulp-uglify'),
concat = require('gulp-concat');
babel = require("gulp-babel");

gulp.task('js', function(){
 gulp.src('js/*.js')
.pipe(babel())  
.pipe(uglify())
  .pipe(concat('script.js'))
  .pipe(gulp.dest('build'))
});


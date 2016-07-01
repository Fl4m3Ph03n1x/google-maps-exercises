var gulp = require("gulp");
var child_exec = require('child_process').exec;

gulp.task('documentation', function(done) {
    child_exec('npm run jsdoc', undefined, done);
});

gulp.task("watch", function() {
    gulp.watch("./*.js", ["documentation"]);
});

import gulp from 'gulp';
import ts from 'gulp-typescript';

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', async () => {
    const { deleteAsync } = await import('del');
    return deleteAsync(['dist/**', '!dist']);
});

gulp.task('tsc', () => {
    return tsProject
        .src()
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
});

gulp.task('chmod', async () => {
    const { chmod } = await import('node:fs/promises');
    return chmod('dist/src/index.js', '755');
});

gulp.task('compile', gulp.series('clean', 'tsc', 'chmod'));

gulp.task('watcher', () => {
    gulp.watch('./src/**/*.ts', gulp.series('compile'));
});

gulp.task('watch', gulp.series('compile', 'watcher'));

// Default task
gulp.task('default', gulp.series('compile'));

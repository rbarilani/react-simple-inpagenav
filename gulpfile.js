var gulp = require('gulp');
var initGulpTasks = require('react-component-gulp-tasks');
var conventionalChangelog = require('gulp-conventional-changelog');

/**
 * Tasks are added by the react-component-gulp-tasks package
 *
 * See https://github.com/JedWatson/react-component-gulp-tasks
 * for documentation.
 *
 * You can also add your own additional gulp tasks if you like.
 */

var taskConfig = {

	component: {
		name: 'SimpleInpagenav',
		file: 'index.js',
		dependencies: [
			'classnames',
			'react'
		],
		lib: 'lib'
	},

	example: {
		src: 'example/src',
		dist: 'example/dist',
		files: [
			'index.html',
			'.gitignore'
		],
		scripts: [
			'example.js'
		],
		less: [
			'example.less'
		]
	}

};

initGulpTasks(gulp, taskConfig);


gulp.task('changelog', function () {
    return gulp.src('CHANGELOG.md', {
        buffer: false
    })
    .pipe(conventionalChangelog({
        preset: 'angular'
    }))
    .pipe(gulp.dest('./'));
});

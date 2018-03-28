var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    fileinclude = require('gulp-file-include'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    htmlmin = require('gulp-htmlmin');


gulp.task('less', function () {
    return gulp.src('app/styles/**/*.less')
        .pipe(autoprefixer('last 5 version'))
        .pipe(less({ compress: true }))
        .pipe(gulp.dest('dist/css'))
})

gulp.task('css', ['less'], function () {
    return gulp.src('dist/css/**/*.css')
        .pipe(rev())
        .pipe(gulp.dest('dist/styles'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/less'))
})

gulp.task('uglify', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(rev())
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/js'))
})

gulp.task('image', function () {
    return gulp.src('app/images/**/*.{jpg,jpeg,png,gif}')
        .pipe(rev())
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true, multipass: true }))
        .pipe(gulp.dest('dist/images'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/rev/image'))
})

gulp.task('lib', function () {
    return gulp.src('app/lib/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/lib'))
})

// gulp上线任务
gulp.task('base', ['css', 'uglify', 'image', 'lib'], function () {
    return gulp.src(['dist/rev/**/*.json', 'app/views/**/*.html'])
        .pipe(fileinclude())
        .pipe(revCollector({ replaceReved: true }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/views'))
})

gulp.task('del:rev', ['base'], function () {
    return del(['dist/rev', 'dist/css']);
})

gulp.task('production', function () {
    return del('dist/*').then(function () {
        gulp.start('del:rev')
    })
})

// gulp开发任务
gulp.task('less-dev', function () {
    return gulp.src('app/styles/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 5 version'))
        .pipe(less({ compress: true }))
        .pipe(sourcemaps.write('../map'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
})

gulp.task('css-dev', ['less-dev'], function () {
    return gulp.src('dist/css/**/*.css')
        .pipe(gulp.dest('dist/styles'))
})

gulp.task('uglify-dev', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('../map'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(browserSync.stream());
})

gulp.task('html-dev', function () {
    return gulp.src('app/views/**/*.html')
        .pipe(fileinclude())
        .pipe(gulp.dest('dist/views'))
        .pipe(browserSync.stream());
})

gulp.task('image-dev', function () {
    return gulp.src('app/images/**/*.{jpg,jpeg,png,gif}')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true, multipass: true }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
})

gulp.task('develop-flow', function () {
    return del('dist/*').then(function () {
        gulp.start(['less-dev', 'css-dev', 'uglify-dev', 'html-dev', 'image-dev', 'lib'])
    })
})

// 本地开发
gulp.task('develop', ['develop-flow'], function () {
    browserSync.init({
        server: {
            baseDir: './dist/'
        },
        port: 8522
    });
    gulp.watch('app/styles/**/*.less', ['css-dev']);
    gulp.watch('app/scripts/**/*.js', ['uglify-dev']);
    gulp.watch('app/images/**/*', ['image-dev']);
    gulp.watch('app/views/**/*', ['html-dev']);
})

// 上线打包
gulp.task('build', ['production']);

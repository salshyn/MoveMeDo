// Gulp task variables
var autoprefixer =  require('gulp-autoprefixer');
var browserSync =   require('browser-sync').create();
var csscomb =       require('gulp-csscomb');
var cleanCss =      require('gulp-clean-css');
var babel =         require('gulp-babel');
var del =           require('del');
var gulp =          require('gulp');
var concat =        require('gulp-concat');
var postcss =       require('gulp-postcss');
var plumber =       require('gulp-plumber');
var runSequence =   require('run-sequence');
var sass =          require('gulp-sass');
var sourcemaps =    require('gulp-sourcemaps');
var uglify =        require('gulp-uglify');
var rename =        require('gulp-rename');
var wait =          require('gulp-wait');

// Path variables
var PATHS = {
    DIST: {
        BASE: 'dist',
        IMAGES: 'dist/assets/img',
        VENDOR: 'dist/assets/vendor'
    },
    BASE: {
        BASE: './',
        NODE: 'node_modules'
    },
    SRC: {
        BASE: './',
        SCSS: 'src/scss/**/*.scss',
        HTML: '**/*.html',
        JS: [
            'node_modules/bluebird/js/browser/bluebird.min.js',
            'src/js/**/*.js'
        ],
    },
    ASSETS: {
        BASE: './',
        CSS: 'assets/css',
        JS: 'assets/js',
        IMAGES: 'assets/img/**/*.+(png|jpg|svg|gif)'
    }
}

// Clean directories
gulp.task('clean:dist', function() {
    return del.sync(PATHS.DIST.BASE);
});

// Live server
gulp.task('browser-sync', ['scss', 'js'], function() {
    browserSync.init({
        server: {
            baseDir: [PATHS.SRC.BASE]
        },
        startPath: 'pages/index.html'
    })
});

// Watch for assets changes
gulp.task('watch', ['browser-sync', 'scss', 'js'], function() {
    gulp.watch(PATHS.SRC.SCSS, ['scss']);
    gulp.watch(PATHS.SRC.JS, ['js']);
    gulp.watch(PATHS.SRC.HTML).on('change', browserSync.reload);
});

// Compile SCSS
gulp.task('scss', function() {
    return gulp.src(PATHS.SRC.SCSS)
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('postcss-flexbugs-fixes')
        ]))
        .pipe(csscomb())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.ASSETS.CSS))
        .pipe(browserSync.reload({
            stream: true
        }));
});
  
// Minify CSS
gulp.task('minify:css', function() {
    return gulp.src(PATHS.ASSETS.CSS + '/theme.css')
        .pipe(sourcemaps.init())
        .pipe(cleanCss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.DIST.BASE + '/css'))
});

// Process JS file and return the stream
gulp.task('js', function () {
    return gulp.src(PATHS.SRC.JS)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('theme.js'))
        .pipe(gulp.dest(PATHS.ASSETS.JS))
        .pipe(browserSync.reload({
            stream: true
        }));
});
  
// Minify JS
gulp.task('minify:js', function() {
    return gulp.src(PATHS.ASSETS.JS + '/theme.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(PATHS.DIST.BASE + '/js'))
});

// Default, development mode
gulp.task('default', function(callback) {
    runSequence(['scss', 'browser-sync', 'watch'], callback);
});

// Production mode
gulp.task('build', function(callback) {
    runSequence('clean:dist', 'scss', 'minify:css', 'minify:js', callback);
});
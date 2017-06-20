var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();

var packageJson = require('./package.json');
var express = require('express');
var glob = require('glob');
var ts = require('gulp-typescript'); // Does not work with gulp-load-plugins?
var httpProxy = require('http-proxy');

var app         = express();
var proxy       = httpProxy.createProxyServer();
var enonic      = 'http://localhost:8080';
var expressPort = 8889;

//__dirname
var srcResourcesDir = 'src/main/resources';
var dstResourcesDir = 'build/resources/main';
var dstSiteDir      = dstResourcesDir + '/site';


var srcGlob = srcResourcesDir + '/**/*.*'; // Not folders
var srcFiles = glob.sync(srcGlob, { absolute: true });
var ignoreGlob = srcResourcesDir + '/**/*.{js,scss,ts}';
var copyFiles = glob.sync(srcGlob, { absolute: true, ignore: ignoreGlob });
var copyTasks = copyFiles.map(f => 'copy:'+ f);

var scssGlob = srcResourcesDir + '/**/*.scss';
var mainScssGlob = srcResourcesDir + '/assets/scss/styles.scss';
var mainScssFile = glob.sync(mainScssGlob, { absolute: true })[0];
var scssFiles = glob.sync(scssGlob, { absolute: true });
console.log('scssFiles:' + JSON.stringify(scssFiles, null, 4));

var tsGlob = srcResourcesDir + '/**/*.ts';
var dtsGlob = srcResourcesDir + '/**/*.d.ts';
var tsFiles = glob.sync(tsGlob, { absolute: true, ignore: dtsGlob });
var dtsFiles = glob.sync(dtsGlob, { absolute: true });
var tsBuildTasks = tsFiles.map(f => 'build:'+ f);
var watchFiles = copyFiles.concat(tsFiles);
//console.log('dtsFiles:' + JSON.stringify(dtsFiles, null, 4));
//process.exit()

//──────────────────────────────────────────────────────────────────────────────
// xml, html, svg, etc...
//──────────────────────────────────────────────────────────────────────────────

copyFiles.forEach(function (filePath) {
    function copyFile() {
        return gulp.src(filePath, { base: srcResourcesDir })
            .pipe(gulp.dest(dstResourcesDir));
    }
    gulp.task('copy:' + filePath, (done) => {
        copyFile();
        done();
    });
    gulp.task('watch:' + filePath, (done) => {
        copyFile().pipe($.livereload());
        done();
    });
});

//──────────────────────────────────────────────────────────────────────────────
// ts -> js
//──────────────────────────────────────────────────────────────────────────────

tsFiles.forEach(function(tsFile) {

    function buildTsFile() {
        var tsProject = ts.createProject('tsconfig.json');
        return gulp.src([tsFile, dtsGlob], { base: srcResourcesDir })
        //.pipe($.debug({ title: 'tsFile:'}))
        .pipe($.plumber())
        .pipe(tsProject())
        .pipe(gulp.dest(dstResourcesDir));
    }

    gulp.task('build:' + tsFile, (done) => {
        buildTsFile();
        done();
    });

    gulp.task('watch:' + tsFile, (done) => {
        buildTsFile().pipe($.livereload());
        done();
    });

}); // tsFiles.forEach

//──────────────────────────────────────────────────────────────────────────────
// Copy package.json dependencies
//──────────────────────────────────────────────────────────────────────────────

gulp.task('build:node_modules', function () {
    return gulp.src(
        Object.keys(packageJson.dependencies).map(function (module) {
            return './node_modules/' + module + '/**/*.js';
        })
        , { base: 'node_modules'}
        )
        //.pipe($.debug({ title: 'nodeModules:'}))
        .pipe(gulp.dest(dstSiteDir + '/lib'));
});

//──────────────────────────────────────────────────────────────────────────────
// scss -> css
//──────────────────────────────────────────────────────────────────────────────

function buildCss() {
    return gulp.src(mainScssFile)
        .pipe($.sourcemaps.init())
        .pipe($.sassGlob())
        .pipe($.sass({ includePaths: '..' }).on('error', $.sass.logError))
        .pipe($.autoprefixer({ browsers: ['last 2 versions', 'ie > 8'], cascade: false }))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(dstSiteDir + '/assets/css'));
}

gulp.task('build:' + mainScssFile, () => {
    buildCss();
});

gulp.task('watch:' + mainScssFile, () => {
    buildCss().pipe($.livereload());
});

//──────────────────────────────────────────────────────────────────────────────

gulp.task('build', ['build:node_modules', 'build:' + mainScssFile ].concat(copyTasks, tsBuildTasks));

gulp.task('watch', ['build'], function() {
    $.livereload({ start: true });
    app.all(/^(?!\/dist).*$/, (req, res) => proxy.web(req, res, { target: enonic }));
    app.use(express.static(__dirname)).listen(expressPort);
    //gulp.watch(assetJsFiles, ['distJsTask']);
    gulp.watch(scssFiles, [ 'watch:' + mainScssFile ]);
    gulp.watch(watchFiles, event => { gulp.start('watch:' + event.path); });
});

gulp.task('default', ['build']);

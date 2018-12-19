var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var fileinclude = require('gulp-file-include');
// var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var cssMin = require('gulp-clean-css');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var replace = require('gulp-replace');

var browserArr = ['last 2 versions', 'ie 9'];

var app = {  // 定义目录
  srcPath: './src/',
  buildPath:'./build/',
  distPath: './dist/'
}

// 处理入口html  注意:打包后链接需要手动修改相对路径!!!
gulp.task('entrance', function () {
  return gulp.src('./index.html')
    .pipe(replace(/="\.\/dist\/html\//gm, '="./html/'))
    .pipe(gulp.dest(app.buildPath))
    .pipe(gulp.dest(app.distPath))
});

// 处理公用html
gulp.task('fileinclude', function () {
  return gulp.src([app.srcPath + 'html/**/*.html'])
    .pipe(fileinclude({
      prefix: '@@',  // 自定义标识前缀
      basepath: app.srcPath + 'html/components'  // 复用组件目录
    }))
    .pipe(gulp.dest(app.buildPath + 'html/'))
    .pipe(gulp.dest(app.distPath + 'html/'));
});

// 处理完lib文件后返回流
gulp.task('lib', function () {
  return gulp.src(app.srcPath + 'lib/**/*')
    .pipe(gulp.dest(app.buildPath + 'lib/'))
    .pipe(gulp.dest(app.distPath + 'lib/'));
});

// 处理完JS文件后返回流
gulp.task('js', function () {
  return gulp.src(app.srcPath + 'js/**/*.js')
    .pipe(gulp.dest(app.buildPath + 'js/'))
    .pipe(uglify({
      mangle: true,//类型：Boolean 默认：true 是否修改变量名
      compress: true,//类型：Boolean 默认：true 是否完全压缩
      ie8: false, //类型：Boolean 默认：false 设置true为支持IE8
    }))
    .pipe(gulp.dest(app.distPath + 'js/'))
});
// 处理less文件后返回流
gulp.task('less', function () {
  return gulp.src(app.srcPath + 'less/**/*.less')
    .pipe(less())
    .pipe(autoprefixer({
      browsers: browserArr,
      cascade: true, //是否美化属性值 默认：true 像这样：
      //-webkit-transform: rotate(45deg);
      //        transform: rotate(45deg);
    }))
    .pipe(gulp.dest(app.buildPath + 'css/'))
    .pipe(cssMin({
      keepSpecialComments: '*'
      //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    }))
    .pipe(gulp.dest(app.distPath + 'css/'))
    .pipe(reload({stream: true}));
});
// 处理完CSS文件后返回流
gulp.task('css', function () {
  return gulp.src(app.srcPath + 'css/**/*.css')
    .pipe(autoprefixer({
      browsers: browserArr,
      cascade: true, //是否美化属性值 默认：true
    }))
    .pipe(gulp.dest(app.buildPath + 'css/'))
    .pipe(cssMin({
      keepSpecialComments: '*'
      //保留所有特殊前缀 当你用autoprefixer生成gulp的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    }))
    .pipe(gulp.dest(app.distPath + 'css/'))
    .pipe(reload({stream: true}));
});

/*处理图片*/
gulp.task('image', function () {
  return gulp.src(app.srcPath + 'images/**/*')
    // .pipe(imagemin())
    .pipe(gulp.dest(app.distPath + 'images/'))
});


// 创建一个任务确保JS任务完成之前能够继续响应
// 浏览器重载
gulp.task('entrance-watch', ['entrance'], reload);
gulp.task('lib-watch', ['lib'], reload);
gulp.task('js-watch', ['js'], reload);
gulp.task('img-watch', ['image'], reload);
gulp.task('html-watch', ['fileinclude'], reload);

//静态服务器+监听
gulp.task('server', ['entrance','js', 'css', 'image', 'lib', 'less'], function () {
  gulp.start('fileinclude');
  browserSync.init({
    port: 8080,
    server: {
      baseDir: './',
    }
  });

  // 无刷新方式更新
  gulp.watch(app.srcPath + 'less/**/*.less', ['less']);
  gulp.watch(app.srcPath + 'css/**/*.css', ['css']);

  // 添加 browserSync.reload 到任务队列里
  // 所有的浏览器重载后任务完成。
  // 刷新页面方式
  gulp.watch('./index.html', ['entrance-watch']);
  gulp.watch(app.srcPath + 'lib/**/*', ['lib-watch']);
  gulp.watch(app.srcPath + 'js/**/*.js', ['js-watch']);
  gulp.watch(app.srcPath + 'images/**/*', ['img-watch']);
  gulp.watch(app.srcPath + 'html/**/*.html', ['html-watch']);
  // gulp.watch(app.distPath + 'html/**/*.html').on('change', reload)
})


/*默认任务*/
gulp.task('default', ['server']);
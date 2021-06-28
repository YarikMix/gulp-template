let project_folder = "dist";
let source_folder = "src";

let fs = require("fs")

let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
		libs: project_folder + "/libs/"
	},
	src: {
		html: [source_folder + "/html/index.html", "!" + source_folder + "/html/common/*.html"],
		css: source_folder + "/sass/style.sass",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/**/*.{woff,woff2}",
		libs: source_folder + "/libs/**/*"
	},
	watch: {
		html: source_folder + "/html/**/*.html",
		css: source_folder + "/sass/*.sass",
		js: source_folder + "/js/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/**/*.{woff,woff2}",
		libs: source_folder + "/libs/**/*"
	},
	clean: "./" + project_folder + "/"
}

let { src, dest } = require("gulp"),
	gulp = require("gulp"),
	browsersync = require("browser-sync").create(),
	fileinclude = require("gulp-file-include"),
	del = require("del"),
	sass = require("gulp-sass"),
	autoprefixer = require("gulp-autoprefixer"),
	group_media = require("gulp-group-css-media-queries"),
	clean_css = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify-es").default;

function browserSync() {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false,
		online: false
	})
}

function html() {
	return src(path.src.html)
	.pipe(fileinclude())
	.pipe(dest(path.build.html))
	.pipe(browsersync.stream())
}

function css() {
	return src(path.src.css)
	.pipe(
		sass({
			outputStyle: "expanded"
		})
	)
	.pipe(group_media())
	.pipe(
		autoprefixer({
			overrideBrowserslist: ["last 10 versions"],
			grid: true,
			cascade: true
		})
	)
	// .pipe(dest(path.build.css))
	.pipe(
		clean_css(({
			level: { 1: {specialComments: 0} } 
		}))
	)
	.pipe(
		rename({
			extname: ".min.css"
		})
	)
	.pipe(dest(path.build.css))
	.pipe(browsersync.stream())
}

function js() {
	return src(path.src.js)
	.pipe(fileinclude())
	// .pipe(dest(path.build.js))
	.pipe(uglify())
	.pipe(
		rename({
			extname: ".min.js"
		})
	)
	.pipe(dest(path.build.js))
	.pipe(browsersync.stream())
}

function images() {
	return src(path.src.img)
	.pipe(dest(path.build.img))
	.pipe(browsersync.stream())
}

function fonts() {
	return src(path.src.fonts)
	.pipe(dest(path.build.fonts))
	.pipe(browsersync.stream())
}

function fontsStyle() {
	let file_content = fs.readFileSync(source_folder + '/sass/utils/fonts.sass');
	if (file_content == '') {
		fs.writeFile(source_folder + '/sass/utils/fonts.sass', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/sass/utils/fonts.sass', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

function libs() {
	return src(path.src.libs)
	.pipe(dest(path.build.libs))
	.pipe(browsersync.stream())
}

function startwatch() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
	gulp.watch([path.watch.fonts], fonts);
	gulp.watch([path.watch.libs], libs);
}

function cleandist() {
	return del(path.clean, { force: true });
}

let build = gulp.series(cleandist, gulp.parallel(html, css, js, images, fonts, libs), fontsStyle);
let watch = gulp.parallel(build, startwatch, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;
exports.libs = libs;
exports.build = build;
exports.watch = watch;
exports.default = watch;
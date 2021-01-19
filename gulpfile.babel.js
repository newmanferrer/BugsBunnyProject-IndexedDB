/* ========================================================= */
/* ACTUALIZACIÓN GULP VERSIÓN 4 | NEWMAN FERRER | 30/06/2020 */
/* ========================================================= */

/* ////////////////////////////////////////////////////////////////////////////////////////////////////////// */

/* ========================================================================================================== */
/* IMPORTACIÓN DE MODULOS O DEPENDENCIAS INSTALADAS A UTILIZAR
============================================================================================================= */
// GULP
import gulp from 'gulp'
// ----------------------------------------------------------------------------------------------------------
// HTMLMIN - MINIFICA Y LIMPIA NUESTRO HTML
import htmlmin from 'gulp-htmlmin'
// ----------------------------------------------------------------------------------------------------------
// CSS
import postcss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'
// ----------------------------------------------------------------------------------------------------------
// JAVASCRIPT - BABEL (COMPATIBILIDAD CON ES5) - TERSER (OFUSCAR EL CÓDIGO)
import babel from 'gulp-babel'
import terser from 'gulp-terser'
// ----------------------------------------------------------------------------------------------------------
// PUG - PRE-PROCESADOR DE HTML
import pug from 'gulp-pug'
// ----------------------------------------------------------------------------------------------------------
// SASS - PRE-PROCESADOR DE CSS
import sass from 'gulp-sass'
// ----------------------------------------------------------------------------------------------------------
// PURGECSS - LIMPIA EL CÓDIGO CSS QUE NO ESTEMOS UTILIZANDO
import purgecss from 'gulp-purgecss'
// ----------------------------------------------------------------------------------------------------------
// CACHÉ BUST - LIMPIA CACHE DE NAVEGADORES
import cacheBust from 'gulp-cache-bust'
// ----------------------------------------------------------------------------------------------------------
// IMAGENMIN - OPTIMIZACIÓN DE IMÁGENES
import imagemin from 'gulp-imagemin'
// ----------------------------------------------------------------------------------------------------------
// PLUMBER - PERMITE CORREGIR ERROR SIN DEJAR DE FUNCIONAR GULP
import plumber from 'gulp-plumber'
// ----------------------------------------------------------------------------------------------------------
// CONCAT - CONCATENA VARIOS ARCHIVOS
import concat from 'gulp-concat'
// ----------------------------------------------------------------------------------------------------------
// BROWSER SYNC - LANZA UN SERVIDOR PARA VER LOS CAMBIOS EN LINEA DE NUESTRO CÓDIGO 
import { init as server, stream, reload } from 'browser-sync'
// ----------------------------------------------------------------------------------------------------------
/* ========================================================================================================== */

/* ////////////////////////////////////////////////////////////////////////////////////////////////////////// */

/* ========================================================================================================== */
/* DECLARACION DE CONSTANTES Y VARIABLES
============================================================================================================= */
const production = true 

const cssPlugins = [
    cssnano(),
    autoprefixer()
]
/* ========================================================================================================= */

/* ////////////////////////////////////////////////////////////////////////////////////////////////////////// */

/* ========================================================================================================== */
/* TAREAS Y VIGILANTES
============================================================================================================= */

// HTML (Solo para cuando necesitemos trabajar con HTML puro - Validar las demas opciones de HTML-MIN)
gulp.task('html-min',() => {
    return gulp
        .src('./dev/*.html')
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./public'))
})
// ----------------------------------------------------------------------------------------------------------

// CSS (Para trabajar con CSS Puro)
gulp.task('styles',() => {
    return gulp
        .src('./dev/css/*.css')
        .pipe(plumber())
        .pipe(concat('styles-min.css'))
        .pipe(postcss(cssPlugins))
        .pipe(gulp.dest('./public/css'))
        .pipe(stream())
})
// ----------------------------------------------------------------------------------------------------------

// JavaScript
if (production) {
    gulp.task('babel',() => {
        return gulp
            .src('./dev/js/*.js')
            .pipe(plumber())
            .pipe(concat('scripts-min.js'))
            .pipe(babel())
            .pipe(terser())
            .pipe(gulp.dest('./public/js'))
    })
}else {
    gulp.task('babel',() => {
        return gulp
            .src('./dev/js/*.js')
            .pipe(plumber())
            .pipe(babel())
            .pipe(gulp.dest('./public/js'))
    })
}
// ----------------------------------------------------------------------------------------------------------

// PUG
gulp.task('pug',() => {
    return gulp
        .src('./dev/views/pages/*.pug')
        .pipe(plumber())
        .pipe(pug({
            pretty: production ? false : true
        }))
        .pipe(cacheBust({
            type: 'timestamp'
        }))
        .pipe(gulp.dest('./public'))
})
// ----------------------------------------------------------------------------------------------------------

// SASS
gulp.task('sass',() => {
    return gulp
        .src('./dev/scss/styles.scss')
        .pipe(plumber())
        .pipe(sass({
            outputStyle: production ? 'compressed' : 'expanded'
        }))
        .pipe(gulp.dest('./public/css'))
        .pipe(stream())
})
// ----------------------------------------------------------------------------------------------------------

// PURGECSS - LIMPIA EL CÓDIGO CSS QUE NO ESTEMOS USANDO (Nota: Sin vigilante, ejecución manual).
gulp.task('purge-css',() => {
    return gulp
        .src('./public/css/styles.css')
        .pipe(plumber())
        .pipe(purgecss({
            content: ['./public/*.html']
        }))
        .pipe(gulp.dest('./public/css'))
})
// ----------------------------------------------------------------------------------------------------------

// IMAGENMIN - OPTIMIZACIÓN DE IMÁGENES (Nota: Sin vigilante, ejecución manual).
gulp.task('imagemin',() => {
    return gulp.src('./dev/assets/images/*')
        .pipe(plumber())
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 30, progressive: true}),
            imagemin.optipng({optimizationLevel: 1})
        ]))
        .pipe(gulp.dest('./public/assets/images'))
})
// ----------------------------------------------------------------------------------------------------------

// Vigilantes
gulp.task('default',() => {
    server({
        server: './public'
    })
    // gulp.watch('./dev/*.html', gulp.series('html-min')).on('change', reload) // HTML PURO
    // gulp.watch('./dev/css/*.css', gulp.series('styles'))
    gulp.watch('./dev/js/*.js', gulp.series('babel')).on('change', reload)
    gulp.watch('./dev/views/**/*.pug', gulp.series('pug')).on('change', reload)
    gulp.watch('./dev/scss/**/*.scss', gulp.series('sass'))
})
// ---------------------------------------------------------------------------------------------------------
/* ========================================================================================================= */
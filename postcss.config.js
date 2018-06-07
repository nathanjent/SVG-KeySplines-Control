module.exports = ctx => ({
    map: true,
    parser: ctx.options.parser,
    plugins: [
        require('postcss-import')({ root: ctx.file.dirname }),
        require('autoprefixer'),
        require('cssnano')({ preset: 'default' }),
    ]
})

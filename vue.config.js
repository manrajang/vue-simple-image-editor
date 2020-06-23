module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/vue-simple-image-editor/' : '/',
  configureWebpack: config => {
    if (process.env.VUE_APP_IS_BUNDLE === 'true') {
      config.externals = {
        'transformation-matrix': 'transformation-matrix'
      }
    }
  }
}

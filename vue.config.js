const autoprefixer = require("autoprefixer");
const pxtoviewport = require("postcss-px-to-viewport");

module.exports = {
  css: {
    loaderOptions: {
      postcss: {
        plugins: [autoprefixer(), pxtoviewport({ viewportWidth: 750 })]
      }
    }
  }
};

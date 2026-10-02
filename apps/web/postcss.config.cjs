// CommonJS on purpose: this file is loaded by PostCSS before the bundler's
// module system applies, and `apps/web` is an ESM package.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

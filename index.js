const defaultOptions = {
  includeMap: false,
  includePublicPath: true,
  ignoreEmpty: true,
  fileName: 'manifest.json',
}

class ManifestPlugin {
  constructor(opts) {
    this.options = Object.assign({}, defaultOptions, opts);
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('ManifestPlugin', (compilation, callback) => {
      const manifest = {};
      const basePath = this.options.includePublicPath ?
        compilation.mainTemplate.getPublicPath({hash: compilation.hash}) : '';

      compilation.chunks.forEach((chunk) => {
        chunk.files.forEach((filename) => {
          if (!chunk.name && this.options.ignoreEmpty) return;
          let ref = manifest[chunk.name];
          if (ref === undefined) {
            ref = {};
            manifest[chunk.name] = ref;
          }

          if (filename.endsWith('css')) {
            ref.css = `${basePath}${filename}`;
          } else if (filename.endsWith('css.map') && this.options.includeMap) {
            ref.cssMap = `${basePath}${filename}`;
          } else if (filename.endsWith('js')) {
            ref.js = `${basePath}${filename}`;
          } else if (filename.endsWith('js.map') && this.options.includeMap) {
            ref.jsMap = `${basePath}${filename}`;
          }
        });
      });

      // Insert this list into the webpack build as a new file asset:
      const json = JSON.stringify(manifest, null, 2)
      compilation.assets[this.options.fileName] = {
        source: () => json,
        size: () => json.length
      };

      callback();
    });
  }
}

module.exports = ManifestPlugin;


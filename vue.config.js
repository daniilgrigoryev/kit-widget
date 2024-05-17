// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  css: {
    extract: process.env.NODE_ENV !== 'production',
  },
  devServer: {
    client: {
      overlay: {
        errors: false,
        warnings: false,
      },
    }
  },
  filenameHashing: false,
  productionSourceMap: false,
  configureWebpack: {
    optimization: {
      splitChunks: false,
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              use: ['pug-plain-loader'],
            },
            {
              use: ['raw-loader', 'pug-plain-loader'],
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['postcss-loader'],
        },
      ],
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('i18n-resource')
      .test(/\.(json5?|ya?ml)$/)
      .include.add(path.resolve(__dirname, './src/locales'))
      .end()
      .type('javascript/auto')
      .use('i18n-resource')
      .loader('@intlify/vue-i18n-loader');
    config.module
      .rule('i18n')
      .resourceQuery(/blockType=i18n/)
      .type('javascript/auto')
      .use('i18n')
      .loader('@intlify/vue-i18n-loader');

    const svgRule = config.module.rule('svg');
    const folderImg = path.resolve(__dirname, 'src/assets/img');
    const folderSprites = path.resolve(__dirname, 'src/assets/sprites');

    svgRule.uses.clear();

    svgRule.exclude.add(folderImg);
    config.module
      .rule('svg-assets')
      .test(/\.(svg)(\?.*)?$/)
      .include.add(folderImg)
      .end()
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'img/assets/[name].[hash:8].[ext]',
      })
      .end();

    svgRule.exclude.add(folderSprites);

    config.module.rule('images').exclude.add(folderSprites);

    config.module
      .rule('icons')
      .test(/\.(svg)(\?.*)?$/)
      .include.add(folderSprites)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]',
        extract: true,
        esModule: false,
        outputPath: '/img/sprites/',
        publicPath: '/img/sprites/',
        spriteFilename: (svgPath) => {
          const dir =
            path
              .parse(svgPath)
              .dir.split(path.sep)
              .pop() || 'common';
          return `${dir}.svg`;
        },
      })
      .end()
      .use('svgo-loader')
      .loader('svgo-loader')
      .options({
        plugins: [
          {
            removeAttrs: { attrs: '(fill|stroke)' },
          },
        ],
      })
      .end();

    svgRule
      .use('svg-html-loader')
      .loader('html-loader')
      .options({
        minimize: true,
        /**
         * Маленький Линтер для внутренностей SVG. Требует писать все clip-path в соответствущем стиле (SC-2969)
         * Развернутое объяснение: Так как файлы SVG инлайнятся в код, то при использовании возможно "протекание" стилей
         * указанных в SVG. Это может быть приводить к багам, когда SVG обрезается по clip-path От другой SVG.
         * Чтобы предотвратить такое - функция требует все <smth id="XXX" /> писать в особом стиле, а именно
         * <smth id="XXX-имяфайла" /> и соответствено место использования как <xxx attr="url(#XXX-имяфайла)" />
         *
         * Требование писать вручную, а не автоматически - перестраховка от корявого кода. В дальнейшем может быть
         * и сделаю этот кусочек не требующим ручного переименования ID внутри SVG
         */
        preprocessor: function(content, loaderContext) {
          try {
            if (content && content.includes('url(#')) {
              // Находим использование ID
              const regExp = /="url\(#(.+)\)"/g;
              let result = null;
              while ((result = regExp.exec(content)) !== null) {
                // Проверить что использование соответствует правилу SMTH-имяфайла
                const { name } = path.parse(loaderContext.resource);
                if (result[1].endsWith(`-${name}`) === false) {
                  loaderContext.emitError(`Файл имеет ID ${result[1]} не соответствующий маске ${result[1]}-${name}`);
                }
                // Проверить, что данный URL вообще есть в SVG
                const isExistsID = content.includes(`id="${result[1]}"`);
                if (isExistsID === false) {
                  loaderContext.emitError(`Файл не содержит элемента с id="${result[1]}"`);
                }
              }
            }
          } catch (error) {
            loaderContext.emitError(error);

            return content;
          }

          return content;
        },
      })
      .end();
  },
  lintOnSave: false,
};

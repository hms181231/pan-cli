let realFileName = './webpack.config.prod.babel';

if (process.env.NODE_ENV === 'development') {
  realFileName = './webpack.config.dev.babel';
}

console.log(`process.env.NODE_ENV=${process.env.NODE_ENV}.`);
console.log(`use webpack config file :"${realFileName}"`);

const config = require(realFileName);

module.exports = config;

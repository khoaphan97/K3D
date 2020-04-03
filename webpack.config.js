const path = require('path');

module.exports = {
    mode: "development",
    entry: {
        app: './src/K3D.js'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'K3D.js'
    },
    module: {
        rules: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            query: {
                presets: ['@babel/env']
            }
        }]
    }
}
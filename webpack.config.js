const path = require('path');

module.exports = {
    mode: "development",
    entry: './src/client/js/main.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'assets', "js"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",//node-modules에서 babel-loader 찾음
                    options: {//해당 로더에게 다음과 같은 옵션 전달
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    }
                }
            }
        ]
    }
};
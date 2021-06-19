const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

const BASE_JS = "./src/client/js/";

module.exports = {
    mode: "development",
    entry: {//여러 js파일을 웹팩에 포함시키려면 오브젝트로 작성하기
        main: BASE_JS + 'main.js',
        videoPlayer: BASE_JS + 'videoPlayer.js',
        recorder: BASE_JS + 'recorder.js',
        commentSection: BASE_JS + 'commentSection.js',
    },
    watch: true,
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css",
    })],
    output: {
        filename: 'js/[name].js',//[name]이라 하면 entry에 있는 이름을 가져옴
        path: path.resolve(__dirname, 'assets'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                //loader를 사용하는 첫 번째 방법
                use: {
                    loader: "babel-loader",//node-modules에서 babel-loader 찾음
                    options: {//해당 로더에게 다음과 같은 옵션 전달
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    }
                }
            },
            {
                test: /\.scss$/,
                //loader를 사용하는 두 번째 방법
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            }
        ]
    }
};
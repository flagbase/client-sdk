const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const rootPath = path.resolve(__dirname, '..')

module.exports = {
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        mainFields: ['main', 'module', 'browser'],
    },
    entry: path.resolve(rootPath, 'app', 'index.tsx'),
    target: 'web',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                    },
                    {
                        loader: 'less-loader', // compiles Less to CSS
                        options: {
                            lessOptions: {
                                // If you are using less-loader@5 please spread the lessOptions to options directly
                                modifyVars: {
                                    'primary-color': '#1E4CF0',
                                    'link-color': '#1DA57A',
                                    'border-radius-base': '2px',
                                    'table-header-color': '#3E2F5B',
                                    'body-background': '#f0f2f5',
                                    'input-hover-border-color': 'transparent'
                                },
                                javascriptEnabled: true,
                            },
                        },
                    },
                ],
               
            },
            {
                test: /\.(jpe?g|gif|png|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                        },
                    },
                ],
            },
        ],
    },
    devServer: {
        static: {
            directory: path.join(rootPath, 'dist/renderer'),
        },
        historyApiFallback: true,
        compress: true,
        hot: true,
        port: 4000,
        devMiddleware: {
            writeToDisk: true,
        },
    },
    output: {
        path: path.resolve(rootPath, 'dist/renderer'),
        filename: 'js/[name].js',
        publicPath: '/',
    },
    plugins: [new HtmlWebpackPlugin()],
}

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const dirNode = 'node_modules';
const dirApp = path.join(__dirname, 'app');
const dirStyles = path.join(__dirname, 'styles');

/**
 * Webpack Configuration
 */
module.exports = env => {
    // Is the current build a development build
    const IS_DEV = !!env.dev;
    
    return {

        entry: {
            main: path.join(dirApp, 'app')
        },

        resolve: {
            modules: [
                dirNode,
                dirApp,
                dirStyles
            ]
        },

        plugins: [
            new webpack.DefinePlugin({ IS_DEV }),
    
            new HtmlWebpackPlugin({
                template: path.join(__dirname, 'index.ejs'),
                title: 'Webpack Boilerplate'
            })
        ],

        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            compact: true
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: IS_DEV
                            }
                        },
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    }
                }
            ]
        },

        optimization: {
            runtimeChunk: 'single'
        }
    };
};
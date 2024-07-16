const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  entry: {
    content: "./src/content.js",
    background: "./src/background.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].bundle.js",
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "src/manifest.json", to: "manifest.json" }],
    }),
    new NodePolyfillPlugin(),
  ],
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    fallback: {
      fs: false,
      net: false,
      tls: false,
      child_process: false,
    },
  },
  optimization: {
    minimize: false,
  },
};

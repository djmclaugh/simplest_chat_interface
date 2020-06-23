var path = require("path")
var webpack = require("webpack")

module.exports = {
  entry: "./client/main.js",
  output: {
    path: path.resolve(__dirname, "./public"),
    filename: "bundle.js"
  },
  mode: "development"
}

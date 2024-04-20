module.exports = {
  plugins: ["@babel/syntax-dynamic-import"],
  presets: [
    [
      "@babel/preset-env",
      {
        modules: "auto",
      },
    ],
    [
      "@babel/preset-react",
      {
        pragma: "myReact.createElement",
        pragmaFrag: "myReact.Fragment",
      },
    ],
  ],
}

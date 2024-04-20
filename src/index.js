// import React from "react"
// import ReactDOM from "react-dom"

import myReact from "./myReact/myReact"
const ReactDOM = myReact

import App from "./App"
import "./index.css"

const app = <App />

const elements = (
  <div>
    <h1>
      <p>I'm h1.</p>
      <a href="https://baidu.com">baidu</a>
    </h1>
    <h2>I'm h2.</h2>
  </div>
)

console.log("render -> elements", elements)

ReactDOM.render(elements, document.getElementById("root"))

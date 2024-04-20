// import React from "react"
// import ReactDOM from "react-dom"

import myReact from "./myReact/myReact"
const ReactDOM = myReact

import App from "./App"
import "./index.css"

const app = <App />

const elements = (
  <div>
    <h1>I'm h1.</h1>
    <a src="https://baidu.com">baidu</a>
  </div>
)

ReactDOM.render(elements, document.getElementById("root"))

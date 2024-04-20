// import React from "react"
// import ReactDOM from "react-dom"

import myReact from "./myReact/myReact"
const ReactDOM = myReact

window.myReact = myReact

import App from "./App"
import "./index.css"

const app = <App a={1} b="sometext" />

const Demo = () => (
  <div className="demo">
    <h1>
      <p>I'm h1.</p>
      <a href="https://baidu.com">baidu</a>
    </h1>
    <h2>I'm h2.</h2>
  </div>
)

const demo = <Demo />

console.log("render -> app", app, demo)

ReactDOM.render(app, document.getElementById("root"))

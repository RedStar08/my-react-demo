function createElement() {
  console.log("createElement -> ")
}

function render(vnode, dom) {
  console.log("render -> ", vnode, dom)
}

const myReact = { createElement, render }

export { createElement, render }

export default myReact

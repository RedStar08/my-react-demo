// 创建文本虚拟DOM
const createTextVDom = (text) => {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
      children: []
    }
  }
}

const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === 'object' ? child : createTextVDom(child)
      })
    }
  }
}

function render(vDom, container) {
  const { type, props } = vDom
  // 检查当前虚拟 dom 是文本还是对象
  let dom
  if (vDom.type === 'TEXT') {
    dom = document.createTextNode(vDom.props.nodeValue)
  } else {
    // 创建真实的 dom 节点
    dom = document.createElement(type)
  }
  // 将除了 children 的属性复制到真实的 dom 节点
  if (props) {
    Object.keys(props).forEach((item) => {
      if (item === 'children') {
        return
      } else {
        dom[item] = props[item]
      }
    })
  }
  // 递归渲染 children
  if (props && props.children && props.children.length) {
    props.children.forEach((child) => {
      render(child, dom)
    })
  }
  container && container.appendChild(dom)
}

const myReact = { createElement, render }

export { createElement, render }

export default myReact

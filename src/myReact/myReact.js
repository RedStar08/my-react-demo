const TEXT_ELEMENT = "TEXT_ELEMENT"
const UPDATE = "UPDATE"
const PLACEMENT = "PLACEMENT"
const DELETION = "DELETION"

/**
 * 创建文本节点
 */
function creatTextElement(text) {
  const vnode = {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      childern: [],
    },
  }
  // console.log("creatTextElement -> ", vnode)
  return vnode
}

function createElement(type, props, ...childern) {
  const vnode = {
    type,
    props: {
      ...props,
      childern: childern.map((child) => {
        return typeof child === "object" ? child : creatTextElement(child)
      }),
    },
  }
  // console.log("createElement -> ", vnode)
  return vnode
}

// #region
// function render(element, container) {
//   // console.log("render -> ", element, container)
//   const dom = element.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(element.type)

//   Object.keys(element.props)
//     .filter((key) => key != "childern")
//     .forEach((key) => {
//       dom[key] = element.props[key]
//     })

//   // 递归遍历子元素 - 此处有性能问题，递归调用无法中断，所以需要开启并发模式
//   element.props.childern.forEach((child) => {
//     render(child, dom)
//   })

//   container.appendChild(dom)
// }
// #endregion

const isEvent = (key) => key.startsWith("on")
const isProperty = (key) => key != "childern" && !isEvent(key)
const isNew = (prev, next) => (key) => prev[key] != next[key]
const isGone = (prev, next) => (key) => !(key in next)

// 根据 fiber 节点（代码层面的虚拟 dom） 创建真实 dom
function createDom(fiber) {
  // console.log("createDom -> ", fiber)
  const dom = fiber.type === TEXT_ELEMENT ? document.createTextNode("") : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}

function updateDom(dom, prevProps, nextProps) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // 删除掉旧的不需要的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = ""
    })

  // 给新的属性赋值
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = nextProps[key]
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

// 提交当前最新的 fiber 树对应的 根节点
function commitRoot() {
  // console.log("commitRoot -> ", wipRoot)
  // 先卸载需要删除的节点
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  // 两个 fiber 树，更新 dom 的操作完成提交之后，当前的 fiber 树就是上一颗（旧的 fiber 树）
  currentRoot = wipRoot
  wipRoot = null
}

// 一次性挂载所有的节点，从上到下，从左到右
function commitWork(fiber) {
  // console.log("fiber -> ", fiber)
  if (!fiber) {
    return
  }

  // 寻找当前最近的父亲节点用于挂载，这一步非常关键（因为必须是 host 节点才可以创建 dom 进行挂载）
  let domPrarentFiber = fiber.parent
  while (!domPrarentFiber.dom) {
    domPrarentFiber = domPrarentFiber.parent
  }
  // 提交当前 fiber 节点的 dom (把当前 fiber 节点的 dom 挂载到 父节点上)
  const domParent = domPrarentFiber.dom
  if (fiber.effectTag === PLACEMENT && fiber.dom != null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === UPDATE && fiber.dom != null) {
    // 对比新旧 props
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === DELETION) {
    commitDeletion(fiber, domParent)
  }
  // 递归挂载子节点
  commitWork(fiber.child)
  // 递归挂载兄弟节点
  commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    // 当前卸载的是 FunctionComponent 所以需要卸载他的子节点
    // 函数组件的返回值只有一个子节点（解释了为什么所有的节点必须包裹在一个节点中，树只能有一个根）
    commitDeletion(fiber.child, domParent)
  }
}

// In the render function we set nextUnitOfWork to the root of the fiber tree.
function render(element, container) {
  // 当前新建的 fiber 树
  wipRoot = {
    dom: container,
    props: {
      childern: [element],
    },
    // 将新旧两颗 fiber 树进行连接
    alternate: currentRoot,
  }

  // 一旦赋值，在当前帧的空闲时间将自动执行
  nextUnitOfWork = wipRoot

  deletions = []
}

/**
 * 当前环是否有下一个任务
 */
let nextUnitOfWork = null

// 新建的 fiber 树 （新的）
let wipRoot = null
// 当前需要对比的 fiber 树（旧的）
let currentRoot = null
// 需要删除的节点
let deletions = null

function workInProgress(deadline) {
  let shouldYield = false

  while (nextUnitOfWork != null && !shouldYield) {
    // 执行当前任务，并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  // 如果当前没有下一个任务执行，并且当前的
  if (nextUnitOfWork == null && wipRoot) {
    console.log("workInProgress -> commitRoot", wipRoot, currentRoot)
    commitRoot()
  }

  // 开启下一帧的空闲时间继续执行任务
  requestIdleCallback(workInProgress)
}

// 启动开始帧的空间时间执行任务
requestIdleCallback(workInProgress)

// Here React also uses keys, that makes a better reconciliation.
// For example, it detects when children change places in the element array
function reconcileChildren(wipFiber, elements) {
  let index = 0
  let preSibling = null

  let oldFiber = wipFiber.alternate && wipFiber.alternate.child

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && oldFiber.type === element.type

    // if the old fiber and the new element have the same type, we can keep the DOM node and just update it with the new props
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: UPDATE,
      }
    }

    // if the type is different and there is a new element, it means we need to create a new DOM node
    if (!sameType && element) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: PLACEMENT,
      }
    }

    // and if the types are different and there is an old fiber, we need to remove the old node
    if (!sameType && oldFiber) {
      oldFiber.effectTag = DELETION
      deletions.push(oldFiber)
    }

    // 比完之后开始对比旧 fiber 的下一个节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      preSibling.sibling = newFiber
    }

    preSibling = newFiber
    index++
  }
}

let wipFiber = null
let hookIndex = null

// 函数组件直接执行，然后再协调
// 当遇到 <App a={1} b="sometext" /> jsx 会编译成类似 { type: App, props: { a: 1, b: "sometext", children: []} } 的 fiber
function updateFunctionComponent(fiber) {
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  console.log("updateFunctionComponent -> fiber", fiber)
  const childern = [fiber.type(fiber.props)]
  reconcileChildren(fiber, childern)
}

function useState(initial) {
  const oldHook = wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  const actions = oldHook ? oldHook.queue : []
  actions.forEach((action) => {
    if (action instanceof Function) {
      hook.state = action(hook.state)
    } else {
      hook.state = action
    }
  })

  const setState = (action) => {
    hook.queue.push(action)
    // 从根节点开启下一轮的 diff
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex++
  return [hook.state, setState]
}

// 当遇到 <h1>123</h1> jsx 会编译成类似 { type: "h1", props: { children: [{ type: TEXT_ELEMENT}]} } 的 fiber
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    // 除了 root fiber 有真实 dom (render 函数给的) ，其余的 fiber 都需要自己去创建
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.childern
  // 需要一次性提交，但是提交之前先需要执行 协调操作 （新旧两颗 fiber 树进行 diff）
  reconcileChildren(fiber, elements)
}

// 执行任务的具体实现
function performUnitOfWork(fiber) {
  // console.log("nextUnitOfWork", fiber)
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // TODO return next unit of work
  // 从上到下，从左到右，依次执行
  if (fiber.child) {
    return fiber.child
  }

  // 检查兄弟节点
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    // 没有最后一个兄弟节点，返回父节点继续执行
    nextFiber = nextFiber.parent
  }
}

const myReact = { createElement, render }

export { createElement, render, useState }

export default myReact

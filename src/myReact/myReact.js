const TEXT_ELEMENT = "TEXT_ELEMENT"
const UPDATE = "UPDATE"
const PLACEMENT = "PLACEMENT"
const DELETION = "PLACEMENT"

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

  const isProperty = (key) => key != "childern"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach((key) => {
      dom[key] = fiber.props[key]
    })

  return dom
}

function updateDom(dom, prevProps, nextProps) {
  // 删除掉旧的不需要的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
      dom[key] = ""
    })

  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // 给新的属性赋值
  Object.keys(prevProps)
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
  // 提交当前 fiber 节点的 dom (把当前 fiber 节点的 dom 挂载到 父节点上)
  const domPrarent = fiber.parent.dom
  if (fiber.effectTag === PLACEMENT && fiber.dom != null) {
    domPrarent.appendChild(fiber.dom)
  } else if (fiber.effectTag === UPDATE && fiber.dom != null) {
    // 对比新旧 props
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === DELETION) {
    domPrarent.removeChild(fiber.dom)
  }
  // 递归挂载子节点
  commitWork(fiber.child)
  // 递归挂载兄弟节点
  commitWork(fiber.sibling)
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

function workLoop(deadline) {
  let shouldYield = false

  while (nextUnitOfWork != null && !shouldYield) {
    // 执行当前任务，并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  // 如果当前没有下一个任务执行，并且当前的
  if (nextUnitOfWork == null && wipRoot) {
    console.log("workLoop -> commitRoot", wipRoot, currentRoot)
    commitRoot()
  }

  // 开启下一帧的空闲时间继续执行任务
  requestIdleCallback(workLoop)
}

// 启动开始帧的空间时间执行任务
requestIdleCallback(workLoop)

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
      // TODO: update node
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
      // TODO： add node
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
      // TODO: delete node
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

// 执行任务的具体实现
function performUnitOfWork(fiber) {
  // console.log("nextUnitOfWork", fiber)
  // TODO add dom node
  if (!fiber.dom) {
    // 除了 root fiber 有真实 dom (render 函数给的) ，其余的 fiber 都需要自己去创建
    fiber.dom = createDom(fiber)
  }

  // 当前的 fiber 任务挂载到自身的父节点（父节点为真实 dom）
  // if (fiber.parent) {
  //   // 这里不能直接就把节点渲染上去，因为任务有可能随时中断，用户不希望看到挂载一半的页面
  //   fiber.parent.dom.appendChild(fiber.dom)
  // }

  // 需要一次性提交，但是提交之前先需要执行 协调操作 （新旧两颗 fiber 树进行 diff）
  // TODO create new fibers (开始执行子节点的 fiber 构建，主要是通过 child parent sibling 连接成树的结构)
  const elements = fiber.props.childern
  reconcileChildren(fiber, elements)

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

export { createElement, render }

export default myReact

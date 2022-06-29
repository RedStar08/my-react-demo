// import React from 'react'
// import ReactDOM from 'react-dom/client'

// import Counter from './myReact/Counter'
// function Demo() {

//   return (
//     <div className="hongxin">
//       <Counter />
//     </div>
//   )
// }
// const hongxin = ReactDOM.createRoot(document.getElementById('hongxin'))
// hongxin.render(<Demo />)

// export default Demo

import React from './myReact/myReact'
const ReactDOM = React

const jsxNode = React.createElement(
  'div',
  { className: 'hongxin' },
  React.createElement('a', { href: 'https://baidu.com', target: '_blank' }, '百度'),
  React.createElement('a', { href: 'https://cn.bing.com', target: '_blank' }, '必应')
)
console.log('jsxNode', jsxNode)
ReactDOM.render(jsxNode, document.getElementById('hongxin'))

import React from 'react'

function Counter() {
  const [count, setCount] = React.useState(0)

  const counter = (
    <div className="hongxin">
      <div>Counter value is: {count}</div>
      <div>
        <button className="Increment" onClick={() => setCount(count + 1)}>
          Increment
        </button>
        <button className="Decrement" onClick={() => setCount(count - 1)}>
          Decrement
        </button>
      </div>
    </div>
  )

  console.log('counter -> jsx', counter)

  return counter
}

export default Counter

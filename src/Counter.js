import { useState } from "./myReact/myReact"

function Counter() {
  const [count, setCount] = useState(0)

  const counter = (
    <div className="hongxin">
      <div>Counter value is: {count}</div>
      <div>
        <button
          className="Increment"
          onClick={() => {
            console.log("Increment -> ")
            setCount(count + 1)
          }}
        >
          Increment
        </button>
        <button
          className="Decrement"
          onClick={() => {
            console.log("Decrement -> ")
            setCount(count - 1)
          }}
        >
          Decrement
        </button>
      </div>
    </div>
  )
  // console.log("Counter -> render -> jsx", counter)

  return counter
}

export default Counter

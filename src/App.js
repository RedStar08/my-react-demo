import logo from "./logo.svg"
import "./App.css"
import { useState } from "./myReact/myReact"
import Counter from "./Counter"

function App() {
  const [count0, setCount0] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
      <br />
      <button
        className="Increment"
        onClick={() => {
          setCount0(count0 + 1)
        }}
      >
        Counter: {count0}
      </button>
      <br />
      <Counter />
    </div>
  )
}

export default App

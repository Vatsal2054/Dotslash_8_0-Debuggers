import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            {/* <Route path="/" /> */}
          </Route>
          <Route path='/login' element={<Login />} />
          {/* <Route path='/signup' element={<SignUp />} /> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

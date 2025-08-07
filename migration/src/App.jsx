import React from 'react'
// import Login from './pages/Login'
import Cadastro from './pages/Cadastro.jsx';
import { ThemeProvider } from './ThemeContext';





function App() {

  
  return (
    <div>
   <ThemeProvider>
      <Cadastro />
      {/* <Login /> */}
    </ThemeProvider>
    </div>
  )
}

export default App

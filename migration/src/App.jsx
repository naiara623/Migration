import React from 'react'
// import Login from './pages/Login'
// import Cadastro from './pages/Cadastro.jsx';
import { ThemeProvider } from './ThemeContext';
import BoasVindas from './pages/BoasVinda';





function App() {

  
  return (
    <div>
   <ThemeProvider>
<BoasVindas/>
      {/* <Cadastro /> */}
      {/* <Login /> */}
    </ThemeProvider>
    </div>
  )
}

export default App

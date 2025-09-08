// App.js
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BoasVindas from './page/BoasVindas';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BoasVindas />} />
      </Routes>
    </Router>
  );
}

export default App;
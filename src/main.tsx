import React from 'react';
import  ReactDom  from 'react-dom/client';
import { BrowserRouter  as Router, Routes, Route} from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/DashBoard';
import Register from './pages/Register';
import './styles/theme.ts';
import registerServiceWorker from './utils/registerServiceWorker.ts';

registerServiceWorker();

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
      </Routes>
    </Router>
  </React.StrictMode>
)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Interview from './pages/interviewRoom';
import { AuthProvider } from './context/authContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/interview/:roomId" element={<Interview />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

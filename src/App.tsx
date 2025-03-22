import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Interview from './pages/interviewRoom';
import { AuthProvider } from './context/authContext';
import Layout from './components/layout';
import Analytics from './pages/analytics';
import UploadPage from './pages/canditateProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Login />} />
            <Route path="/interview/:roomId" element={<Interview />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          <Route path='/candidate-profile' element={<UploadPage/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

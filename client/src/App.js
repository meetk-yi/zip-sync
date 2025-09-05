import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import ProjectDetails from './components/ProjectDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          {/* <Route path="/preview/:id" element={<ProjectDetails />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

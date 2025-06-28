import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AuthPage from './components/AuthPage'
import MainApp from './components/MainApp'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-900">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
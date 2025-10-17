// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'; // IMPORTA O PROVIDER

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* ENVOLVE O APP COM O PROVIDER */}
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
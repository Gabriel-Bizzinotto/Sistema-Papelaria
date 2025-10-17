// src/App.jsx

import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify'; // NOVO: Importa o container
import 'react-toastify/dist/ReactToastify.css';  // NOVO: Importa o CSS das notificações

import Estoque from './pages/Estoque';
import Caixa from './pages/Caixa';
import Financeiro from './pages/Financeiro';
import Register from './pages/Register';
import Login from './pages/Login';
import axios from 'axios';

// Configuração global do Axios para enviar o token
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" />;
}

// Componente para o Layout Principal (quando logado)
function MainLayout({ children }) {
  const { usuario, logout } = useAuth();
  
  const linkStyle = "px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors";
  const activeLinkStyle = "px-3 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50";

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-xl font-bold text-gray-800">PDV Digital</div>
              <div className="flex items-baseline space-x-4">
                <NavLink to="/" className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Estoque</NavLink>
                <NavLink to="/caixa" className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Caixa</NavLink>
                <NavLink to="/financeiro" className={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Financeiro</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, <span className="font-medium">{usuario.nome}</span></span>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="mt-6">{children}</main>
    </>
  );
}

function App() {
  const { usuario } = useAuth();

  return (
    <BrowserRouter>
      {/* NOVO: Componente que renderiza as notificações */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><MainLayout><Estoque /></MainLayout></ProtectedRoute>} />
        <Route path="/caixa" element={<ProtectedRoute><MainLayout><Caixa /></MainLayout></ProtectedRoute>} />
        <Route path="/financeiro" element={<ProtectedRoute><MainLayout><Financeiro /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={usuario ? "/" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
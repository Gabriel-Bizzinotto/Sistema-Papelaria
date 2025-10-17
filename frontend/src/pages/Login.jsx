// src/pages/Login.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, senha });
      const { token, usuario } = response.data;
      login(usuario, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">PDV Digital</h1>         
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Login</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha</label>
            <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" id="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors" type="submit">Entrar</button>
          </div>
          {error && <p className="text-center text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
        <p className="text-center text-gray-500 text-sm">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="font-bold text-blue-500 hover:text-blue-800">
            Registre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
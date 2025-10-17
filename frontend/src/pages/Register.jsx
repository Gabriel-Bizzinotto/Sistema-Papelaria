// src/pages/Register.jsx

import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      // CORREÇÃO AQUI
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { nome, email, senha });
      setMessage(response.data.message + " Redirecionando para o login...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar.');
    }
  };

  return (
    <div className="bg-gray-100 flex justify-center items-center h-screen">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Sistema Papelaria</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Registrar Novo Usuário</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">Nome</label>
            <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha</label>
            <input className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700" id="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition-colors" type="submit">Registrar</button>
          </div>
          {error && <p className="text-center text-red-500 text-xs italic mt-4">{error}</p>}
          {message && <p className="text-center text-green-500 text-xs italic mt-4">{message}</p>}
        </form>
        <p className="text-center text-gray-500 text-sm">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-bold text-blue-500 hover:text-blue-800">
            Faça o login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

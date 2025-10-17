// src/pages/Financeiro.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function Financeiro() {
  const [vendas, setVendas] = useState([]);
  const [relatorioPorDia, setRelatorioPorDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVendas, resRelatorio] = await Promise.all([
          // CORREÇÃO AQUI
          axios.get(`${import.meta.env.VITE_API_URL}/api/vendas`),
          // CORREÇÃO AQUI
          axios.get(`${import.meta.env.VITE_API_URL}/api/relatorios/vendas-por-dia`)
        ]);
        setVendas(resVendas.data);
        setRelatorioPorDia(resRelatorio.data);
      } catch (err) {
        setError('Não foi possível carregar os dados financeiros.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVendaClick = async (venda) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    setSelectedVenda({ ...venda, itens: [] });
    try {
      // CORREÇÃO AQUI
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendas/${venda.id}`);
      setSelectedVenda({ ...venda, itens: response.data });
    } catch (err) {
      console.error('Erro ao buscar detalhes da venda:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVenda(null);
  };

  if (loading) return <p className="text-center mt-8">Carregando dados financeiros...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
        Módulo Financeiro
      </h1>

      {/* PAINEL DE RESUMO DE VENDAS POR DIA (AGORA RESTAURADO) */}
      <section className="mb-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Resumo de Vendas por Dia</h2>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="py-3 px-6">Data</th>
              <th scope="col" className="py-3 px-6 text-right">Total Vendido (R$)</th>
            </tr>
          </thead>
          <tbody>
            {relatorioPorDia.map(relatorio => (
              <tr key={relatorio.dia} className="border-b">
                <td className="py-3 px-6 font-medium">
                  {new Date(relatorio.dia).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </td>
                <td className="py-3 px-6 text-right font-bold text-green-700">
                  {parseFloat(relatorio.total_vendido).toFixed(2).replace('.', ',')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tabela de Histórico Detalhado (clicável) */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Histórico Detalhado de Vendas</h2>
        <main className="overflow-x-auto relative">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="py-3 px-6">ID da Venda</th>
                <th scope="col" className="py-3 px-6">Data e Hora</th>
                <th scope="col" className="py-3 px-6 text-right">Valor Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => (
                <tr key={venda.id} onClick={() => handleVendaClick(venda)} className="border-b hover:bg-blue-50 cursor-pointer transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-800">{venda.id}</td>
                  <td className="py-4 px-6">{new Date(venda.data_venda).toLocaleString('pt-BR')}</td>
                  <td className="py-4 px-6 text-right font-semibold text-green-700">{parseFloat(venda.valor_total).toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </section>

      {/* Modal de Detalhes da Venda */}
      {isModalOpen && selectedVenda && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Detalhes da Venda #{selectedVenda.id}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            {loadingDetails ? (
              <p>Carregando itens...</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-4 text-center">Qtd.</th>
                    <th className="py-3 px-4 text-right">Preço Unit.</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVenda.itens && selectedVenda.itens.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{item.produto_nome}</td>
                      <td className="py-3 px-4 text-center">{item.quantidade}</td>
                      <td className="py-3 px-4 text-right">R$ {parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}</td>
                      <td className="py-3 px-4 text-right font-semibold">R$ {(item.quantidade * parseFloat(item.preco_unitario)).toFixed(2).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="text-right mt-6">
              <span className="text-lg font-medium">Total da Venda: </span>
              <span className="text-xl font-bold text-green-700">R$ {parseFloat(selectedVenda.valor_total).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financeiro;

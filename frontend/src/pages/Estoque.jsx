// src/pages/Estoque.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Estoque() {
  // --- ESTADOS GERAIS ---
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- ESTADOS DO FORMULÁRIO DE CRIAÇÃO ---
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');

  // --- ESTADOS DO MODAL DE EDIÇÃO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // --- ESTADOS PARA PESQUISA E PAGINAÇÃO ---
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [termoBusca, setTermoBusca] = useState('');
  const [debounceTimeout, setDebounceTimeout] = useState(null);


  // --- EFEITO PARA BUSCAR DADOS PAGINADOS E COM PESQUISA ---
  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:3001/api/produtos`, {
          params: {
            pagina: paginaAtual,
            busca: termoBusca,
            limite: 10 // Mostra 10 itens por página
          }
        });
        setProdutos(response.data.produtos);
        setTotalPaginas(response.data.totalPaginas);
      } catch (err) {
        setError("Não foi possível carregar os produtos.");
        toast.error("Não foi possível carregar os produtos.");
        console.error("Erro ao buscar produtos:", err);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce: espera 300ms após o usuário parar de digitar para fazer a busca
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(() => {
        fetchProdutos();
    }, 300);
    setDebounceTimeout(timeout);

    return () => clearTimeout(timeout); // Limpa o timeout ao desmontar
  }, [paginaAtual, termoBusca]);


  // --- FUNÇÕES CRUD ---

  const handleSubmit = async (event) => {
    event.preventDefault();
    const novoProduto = { nome, preco_venda: parseFloat(preco), quantidade_estoque: parseInt(quantidade), codigo_barras: codigoBarras };
    try {
      await axios.post('http://localhost:3001/api/produtos', novoProduto);
      toast.success('Produto adicionado com sucesso!');
      setNome(''); setPreco(''); setQuantidade(''); setCodigoBarras('');
      setPaginaAtual(1); setTermoBusca(''); // Volta para a página 1 da lista completa
    } catch (error) { toast.error(error.response?.data?.message || 'Erro ao salvar o produto.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza de que deseja deletar este produto?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/produtos/${id}`);
      toast.success('Produto deletado com sucesso!');
      // Recarrega a página atual para refletir a remoção
      setProdutos(produtos.filter(p => p.id !== id));
    } catch (error) { toast.error('Não foi possível deletar o produto.'); }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();
    if (!editingProduct) return;
    try {
      const response = await axios.put(`http://localhost:3001/api/produtos/${editingProduct.id}`, editingProduct);
      toast.success('Produto atualizado com sucesso!');
      setProdutos(produtos.map(p => (p.id === editingProduct.id ? response.data : p)));
      handleCloseModal();
    } catch (error) { toast.error(error.response?.data?.message || 'Erro ao atualizar produto!'); }
  };

  // Funções de controle do modal
  const handleEditClick = (produto) => { setEditingProduct(produto); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingProduct(null); };
  const handleEditFormChange = (event) => { const { name, value } = event.target; setEditingProduct({ ...editingProduct, [name]: value }); };

  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      
      {/* Formulário de Adicionar Produto */}
      <section className="mb-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Adicionar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2"><label htmlFor="nome" className="block text-sm font-medium text-gray-600">Nome do Produto</label><input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/></div>
            <div><label htmlFor="preco" className="block text-sm font-medium text-gray-600">Preço (R$)</label><input type="number" id="preco" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/></div>
            <div><label htmlFor="quantidade" className="block text-sm font-medium text-gray-600">Quantidade</label><input type="number" id="quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/></div>
            <div className="lg:col-span-2"><label htmlFor="codigoBarras" className="block text-sm font-medium text-gray-600">Código de Barras</label><input type="text" id="codigoBarras" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"/></div>
            <div className="md:col-span-2 lg:col-span-5 flex justify-end items-center"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Salvar Produto</button></div>
        </form>
      </section>

      {/* Seção da Lista de Produtos com Pesquisa */}
      <section className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Lista de Produtos</h2>
            <input 
                type="text"
                placeholder="Pesquisar por nome..."
                onChange={(e) => { setTermoBusca(e.target.value); setPaginaAtual(1); }}
                className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>

        {/* Tabela de Produtos */}
        <main className="overflow-x-auto relative min-h-[300px]">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Carregando produtos...</p>
          ) : (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6">ID</th>
                  <th scope="col" className="py-3 px-6">Produto</th>
                  <th scope="col" className="py-3 px-6">Código de Barras</th>
                  <th scope="col" className="py-3 px-6 text-center">Estoque</th>
                  <th scope="col" className="py-3 px-6 text-right">Preço (R$)</th>
                  <th scope="col" className="py-3 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(produto => (
                  <tr key={produto.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-bold text-gray-800">{produto.id}</td>
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{produto.nome}</td>
                    <td className="py-4 px-6">{produto.codigo_barras}</td>
                    <td className="py-4 px-6 text-center">{produto.quantidade_estoque}</td>
                    <td className="py-4 px-6 text-right font-semibold">{parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}</td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button onClick={() => handleEditClick(produto)} className="bg-blue-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-600 transition-colors text-xs">Editar</button>
                      <button onClick={() => handleDelete(produto.id)} className="bg-red-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-red-700 transition-colors text-xs">Deletar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
        
        {/* Componente de Paginação */}
        {!loading && totalPaginas > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600">
                  Página {paginaAtual} de {totalPaginas}
              </span>
              <div className="flex items-center space-x-2">
                  <button 
                      onClick={() => setPaginaAtual(p => Math.max(p - 1, 1))} 
                      disabled={paginaAtual === 1}
                      className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Anterior
                  </button>
                  <button 
                      onClick={() => setPaginaAtual(p => Math.min(p + 1, totalPaginas))} 
                      disabled={paginaAtual === totalPaginas}
                      className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Próxima
                  </button>
              </div>
          </div>
        )}
      </section>

      {/* Modal de Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg mx-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Editar Produto</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4"><label htmlFor="edit-nome" className="block text-sm font-medium text-gray-700">Nome</label><input type="text" name="nome" id="edit-nome" value={editingProduct.nome} onChange={handleEditFormChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"/></div>
              <div className="mb-4"><label htmlFor="edit-preco" className="block text-sm font-medium text-gray-700">Preço</label><input type="number" step="0.01" name="preco_venda" id="edit-preco" value={editingProduct.preco_venda} onChange={handleEditFormChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"/></div>
              <div className="mb-4"><label htmlFor="edit-quantidade" className="block text-sm font-medium text-gray-700">Quantidade</label><input type="number" name="quantidade_estoque" id="edit-quantidade" value={editingProduct.quantidade_estoque} onChange={handleEditFormChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"/></div>
              <div className="mb-4"><label htmlFor="edit-codigo" className="block text-sm font-medium text-gray-700">Código de Barras</label><input type="text" name="codigo_barras" id="edit-codigo" value={editingProduct.codigo_barras} onChange={handleEditFormChange} className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm"/></div>
              <div className="flex justify-end space-x-4 mt-8"><button type="button" onClick={handleCloseModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Cancelar</button><button type="submit" className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Salvar Alterações</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
// src/pages/Caixa.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Caixa() {
  const [todosProdutos, setTodosProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [valorTotal, setValorTotal] = useState(0);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  
  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        // CORREÇÃO AQUI
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/produtos`);
        // O `response.data` da rota de produtos paginada é um objeto
        setTodosProdutos(response.data.produtos || []); 
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Não foi possível carregar os produtos do estoque.");
      }
    };
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (termoBusca === '') {
      setResultadosBusca([]);
      return;
    }
    const resultadosFiltrados = todosProdutos.filter(produto =>
      produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      (produto.codigo_barras && produto.codigo_barras.includes(termoBusca))
    );
    setResultadosBusca(resultadosFiltrados);
  }, [termoBusca, todosProdutos]);

  useEffect(() => {
    const novoTotal = carrinho.reduce((total, item) => total + (item.quantidade * parseFloat(item.preco_venda)), 0);
    setValorTotal(novoTotal);
  }, [carrinho]);

  const adicionarAoCarrinho = (produto) => {
    const produtoExistente = carrinho.find(item => item.id === produto.id);
    if (produtoExistente) {
      if (produtoExistente.quantidade < produto.quantidade_estoque) {
        atualizarQuantidade(produto.id, produtoExistente.quantidade + 1);
      } else {
        toast.warn('Quantidade máxima em estoque atingida.');
      }
    } else {
      if (produto.quantidade_estoque > 0) {
        setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
      } else {
        toast.error('Produto sem estoque.');
      }
    }
    setTermoBusca('');
  };

  const atualizarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
    } else {
      setCarrinho(carrinho.map(item =>
        item.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
      ));
    }
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter(item => item.id !== produtoId));
  };
  
  const finalizarVenda = async () => {
    if (carrinho.length === 0) return;
    const dadosVenda = {
      valor_total: valorTotal,
      itens: carrinho.map(item => ({
        produto_id: item.id,
        quantidade: item.quantidade,
        preco_unitario: parseFloat(item.preco_venda)
      }))
    };
    try {
      // CORREÇÃO AQUI
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vendas`, dadosVenda);
      toast.success('Venda registrada com sucesso!');
      setCarrinho([]);
      setTermoBusca('');
    } catch (error) {
      console.error("Erro ao finalizar a venda:", error);
      toast.error(`Falha ao registrar a venda: ${error.response?.data?.message || 'Erro desconhecido.'}`);
    }
  };
  
  return (
    <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Venda Atual</h2>
        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-left">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="py-3 px-2 font-semibold text-gray-600">Produto</th>
                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Qtd.</th>
                <th className="py-3 px-2 font-semibold text-gray-600 text-right">Preço Unit.</th>
                <th className="py-3 px-2 font-semibold text-gray-600 text-right">Subtotal</th>
                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Remover</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-gray-500 py-8">O carrinho está vazio.</td></tr>
              ) : (
                carrinho.map(item => {
                  const produtoCompleto = todosProdutos.find(p => p.id === item.id) || {};
                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-4 px-2">{item.nome}</td>
                      {/* === BOTÕES DE QUANTIDADE ESTILIZADOS === */}
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)} className="text-red-500 bg-red-100 rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg hover:bg-red-200 transition-colors">-</button>
                          <span className="font-medium text-gray-800">{item.quantidade}</span>
                          <button 
                            onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)} 
                            disabled={item.quantidade >= produtoCompleto.quantidade_estoque}
                            className="text-green-500 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center font-bold text-lg hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >+</button>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right text-gray-600">R$ {parseFloat(item.preco_venda).toFixed(2).replace('.', ',')}</td>
                      <td className="py-4 px-2 text-right font-semibold text-gray-800">R$ {(item.quantidade * parseFloat(item.preco_venda)).toFixed(2).replace('.', ',')}</td>
                      {/* === BOTÃO DE REMOÇÃO ESTILIZADO === */}
                      <td className="py-4 px-2 text-center">
                        <button onClick={() => removerDoCarrinho(item.id)} className="text-gray-400 bg-gray-100 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xl hover:text-red-600 hover:bg-red-100 transition-colors">
                          &times;
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex justify-between items-center border-t pt-4">
          <div><span className="text-xl font-medium text-gray-600">Total:</span><span className="text-3xl font-bold text-gray-900 ml-2">R$ {valorTotal.toFixed(2).replace('.', ',')}</span></div>
          <button onClick={finalizarVenda} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400" disabled={carrinho.length === 0}>Finalizar Venda</button>
        </div>
      </div>

      {/* Coluna de Busca de Produtos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Buscar Produto</h2>
        <input type="text" placeholder="Digite o nome ou código de barras" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        <ul className="mt-4 max-h-96 overflow-y-auto">
          {resultadosBusca.map(produto => (
            <li key={produto.id} onClick={() => adicionarAoCarrinho(produto)} className="p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between">
              <div><p className="font-semibold">{produto.nome}</p><p className="text-sm text-gray-500">Estoque: {produto.quantidade_estoque}</p></div>
              <p className="font-semibold">R$ {parseFloat(produto.preco_venda).toFixed(2).replace('.', ',')}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Caixa;

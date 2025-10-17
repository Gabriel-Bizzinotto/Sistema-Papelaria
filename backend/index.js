// backend/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Configuração da Conexão com o Banco de Dados com SSL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { // ADIÇÃO PARA CONEXÃO SEGURA COM O NEON
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API da Papelaria está funcionando!');
});

// ROTAS DE AUTENTICAÇÃO
app.post('/api/auth/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) { return res.status(400).json({ message: 'Todos os campos são obrigatórios.' }); }
    try {
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        const query = `INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email;`;
        const values = [nome, email, senhaHash];
        const { rows } = await pool.query(query, values);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', usuario: rows[0] });
    } catch (error) { console.error('Erro ao registrar usuário:', error); if (error.code === '23505') { return res.status(409).json({ message: 'Este e-mail já está cadastrado.' }); } res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) { return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' }); }
    try {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const { rows } = await pool.query(query, [email]);
        const usuario = rows[0];
        if (!usuario) { return res.status(401).json({ message: 'Credenciais inválidas.' }); }
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) { return res.status(401).json({ message: 'Credenciais inválidas.' }); }
        const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token: token,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
        });
    } catch (error) { console.error('Erro no login:', error); res.status(500).json({ message: 'Erro interno do servidor' }); }
});

// Middleware de Verificação de Token
const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) return res.sendStatus(403);
        req.usuario = usuario;
        next();
    });
};

// ROTAS PROTEGIDAS

// =================================================================
// === ROTA DE PRODUTOS ATUALIZADA PARA PESQUISA E PAGINAÇÃO ===
// =================================================================
app.get('/api/produtos', verificarToken, async (req, res) => {
    const { pagina = 1, limite = 10, busca = '' } = req.query;
    const offset = (pagina - 1) * limite;
    // Usamos ILIKE para busca case-insensitive
    const termoBusca = `%${busca}%`;

    try {
        const [dataResult, countResult] = await Promise.all([
            pool.query(
                'SELECT * FROM produtos WHERE nome ILIKE $1 ORDER BY id ASC LIMIT $2 OFFSET $3', 
                [termoBusca, limite, offset]
            ),
            pool.query(
                'SELECT COUNT(*) FROM produtos WHERE nome ILIKE $1', 
                [termoBusca]
            )
        ]);

        const produtos = dataResult.rows;
        const totalProdutos = parseInt(countResult.rows[0].count, 10);
        const totalPaginas = Math.ceil(totalProdutos / limite);

        res.status(200).json({
            produtos,
            totalProdutos,
            totalPaginas,
            paginaAtual: parseInt(pagina, 10)
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.post('/api/produtos', verificarToken, async (req, res) => {
  const { nome, preco_venda, quantidade_estoque, codigo_barras } = req.body;
  if (!nome) { return res.status(400).json({ message: 'O nome do produto é obrigatório.' }); }
  try { const query = `INSERT INTO produtos (nome, preco_venda, quantidade_estoque, codigo_barras) VALUES ($1, $2, $3, $4) RETURNING *;`; const values = [nome, preco_venda, quantidade_estoque, codigo_barras]; const { rows } = await pool.query(query, values); res.status(201).json(rows[0]); } catch (error) { console.error('Erro ao criar produto:', error); if (error.code === '23505') { return res.status(409).json({ message: 'Já existe um produto com este código de barras.' }); } res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.delete('/api/produtos/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try { const result = await pool.query('DELETE FROM produtos WHERE id = $1', [id]); if (result.rowCount === 0) { return res.status(404).json({ message: 'Produto não encontrado.' }); } res.status(204).send(); } catch (error) { console.error('Erro ao deletar produto:', error); res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.put('/api/produtos/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    const { nome, preco_venda, quantidade_estoque, codigo_barras } = req.body;
    if (!nome) { return res.status(400).json({ message: 'O nome do produto é obrigatório.' }); }
    try { const query = `UPDATE produtos SET nome = $1, preco_venda = $2, quantidade_estoque = $3, codigo_barras = $4 WHERE id = $5 RETURNING *;`; const values = [nome, preco_venda, quantidade_estoque, codigo_barras, id]; const { rows } = await pool.query(query, values); if (rows.length === 0) { return res.status(404).json({ message: 'Produto não encontrado.' }); } res.status(200).json(rows[0]); } catch (error) { console.error('Erro ao atualizar produto:', error); if (error.code === '23505') { return res.status(409).json({ message: 'Já existe outro produto com este código de barras.' }); } res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.post('/api/vendas', verificarToken, async (req, res) => {
    const { valor_total, itens } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const vendaQuery = 'INSERT INTO vendas (valor_total) VALUES ($1) RETURNING id';
        const vendaResult = await client.query(vendaQuery, [valor_total]);
        const vendaId = vendaResult.rows[0].id;
        for (const item of itens) {
            const itemQuery = 'INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)';
            await client.query(itemQuery, [vendaId, item.produto_id, item.quantidade, item.preco_unitario]);
            const estoqueQuery = 'UPDATE produtos SET quantidade_estoque = quantidade_estoque - $1 WHERE id = $2';
            await client.query(estoqueQuery, [item.quantidade, item.produto_id]);
        }
        await client.query('COMMIT');
        res.status(201).json({ message: 'Venda registrada com sucesso!', venda_id: vendaId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao registrar venda:', error);
        res.status(500).json({ message: 'Falha ao registrar a venda.' });
    } finally { client.release(); }
});
app.get('/api/vendas', verificarToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM vendas ORDER BY data_venda DESC';
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) { console.error('Erro ao buscar histórico de vendas:', error); res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.get('/api/vendas/:id', verificarToken, async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT iv.quantidade, iv.preco_unitario, p.nome as produto_nome 
            FROM itens_venda iv JOIN produtos p ON iv.produto_id = p.id
            WHERE iv.venda_id = $1;
        `;
        const { rows } = await pool.query(query, [id]);
        if (rows.length === 0) { return res.status(404).json({ message: 'Itens não encontrados para esta venda.' }); }
        res.status(200).json(rows);
    } catch (error) { console.error('Erro ao buscar detalhes da venda:', error); res.status(500).json({ message: 'Erro interno do servidor' }); }
});
app.get('/api/relatorios/vendas-por-dia', verificarToken, async (req, res) => {
    try {
        const query = `
            SELECT CAST(data_venda AS DATE) as dia, SUM(valor_total) as total_vendido
            FROM vendas GROUP BY CAST(data_venda AS DATE) ORDER BY dia DESC;
        `;
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar relatório de vendas por dia:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

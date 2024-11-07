const express = require('express')
const app = express()
const port = 3000
const db = require("./db.js")
app.use(express.json())
const cors = require('cors')
app.use(cors())

/* #### MÉTODOS DO CLIENTE #### */
app.post('/clientes', async (req, res) => {
    let cliente = req.body
    //cliente.data_nasc = converterDataParaISO(cliente.data_nasc) 
    try {
        const resultado = await db.pool.query("INSERT INTO clientes (nome, email, telefone, data_nasc, cep, rua, numero, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
            cliente.nome, cliente.email, 
            cliente.telefone, cliente.data_nasc, 
            cliente.cep, cliente.rua, 
            cliente.numero, cliente.bairro, 
            cliente.cidade, cliente.estado])
        res.send(JSON.stringify({id: Number(resultado.insertId)}))
    } catch (error) {
        throw error;
    }
})

// GET que retorna apenas os IDs:
app.get('/clientes', async (req, res) => {
    let idClientes = [];
    try {
        const dados_clientes = await db.pool.query(
            "SELECT id_cliente FROM clientes"
        )
        dados_clientes.forEach(cliente => {
            idClientes.push(cliente.id_cliente)
        });
        res.send(idClientes)
    } catch (error) {
        throw error;
    }
}) 

// GET que retorna os detalhes de 1 cliente:
app.get('/clientes/:id', async (req, res) => {
    try {
        const dados_cliente = await db.pool.query(
            "SELECT * FROM clientes WHERE id_cliente = " + req.params.id
        )
        if(dados_cliente.length != 0){
            console.log(dados_cliente[0].data_nasc)
            dados_cliente[0].data_nasc = converterDataParaBrasil(dados_cliente[0].data_nasc)
            res.send(dados_cliente[0])
        } else {
            res.send(JSON.stringify({erro: "inexistente"}))
        }
        
    } catch (error) {
        throw error;
    }
})

app.delete('/clientes', async (req, res) => {
    let id = req.query.id
    try {
        const resultado = await db.pool.query("DELETE FROM clientes WHERE id_cliente = ?", [id])
        if (resultado.affectedRows != 0) {
            res.send(JSON.stringify({ id: id}))
            console.log("Excluído: " + id)
        } else {
            res.send(JSON.stringify({ erro: "inexistente"}))
        }
    } catch (error) {
        throw error;
    }
})

app.put('/clientes/:id', async (req,res) => {
    let idCliente = req.params.id
    let dadosAlteracao = req.body
    dadosAlteracao.data_nasc = converterDataParaISO(dadosAlteracao.data_nasc)
    try{
        const resultado = await db.pool.query('UPDATE clientes SET nome = ?, email = ?, telefone = ?, data_nasc = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, estado = ? WHERE id_cliente = ?', [
            dadosAlteracao.nome, dadosAlteracao.email, 
            dadosAlteracao.telefone, dadosAlteracao.data_nasc, 
            dadosAlteracao.cep, dadosAlteracao.rua, 
            dadosAlteracao.numero, dadosAlteracao. bairro, 
            dadosAlteracao.cidade, dadosAlteracao.estado, 
            idCliente])
        res.send(JSON.stringify({id: idCliente, alteracao: 'ok'}));
    } catch (error) {
        throw error
    }
})
/* #### FIM MÉTODOS DO CLIENTE #### */

/* -------------------------------- */

/* #### MÉTODOS DO PRODUTO #### */
app.post('/produtos', async (req, res) => {
    let produto = req.body   
    try {
        const resultado = await db.pool.query("INSERT INTO produtos (nome, descricao, quantidade, preco, categoria, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)", [
            produto.nome, produto.descricao, 
            produto.quantidade, produto.preco, 
            produto.categoria, produto.data_cadastro])
        res.send(JSON.stringify({id: Number(resultado.insertId)}))
    } catch (error) {
        throw error;
    }
})

app.get('/produtos', async (req, res) => {
    let categoria = req.query.categoria
    let dados_produtos
    try {
        // Verifica se o usuário deseja aplicar o filtro de categoria ou não:
        if (categoria == undefined){
            dados_produtos = await db.pool.query(
                "SELECT * FROM produtos"
            )
        } else {
            dados_produtos = await db.pool.query(
                "SELECT * FROM produtos WHERE categoria = ?", [categoria]
            )
        }
        // Conversão das datas do Banco de Dados para formato BR:
        dados_produtos.map((produto) => {
            produto.data_cadastro = converterDataParaBrasil(produto.data_cadastro)
        }) 
        res.send(dados_produtos)
    } catch (error) {
        throw error;
    }
}) 

app.delete('/produtos', async (req, res) => {
    let id = req.query.id
    try {
        const resultado = await db.pool.query("DELETE FROM produtos WHERE id_produto = ?", [id])
        if (resultado.affectedRows != 0) {
            res.send(JSON.stringify({ id: id}))
            console.log("Produto excluído: " + id)
        } else {
            res.send(JSON.stringify({ erro: "inexistente"}))
        }
    } catch (error) {
        throw error;
    }
})

app.put('/produtos/:id', async (req,res) => {
    let idProduto = req.params.id
    let dadosAlteracao = req.body
    dadosAlteracao.data_cadastro = converterDataParaISO(dadosAlteracao.data_cadastro)
    try{
        const resultado = await db.pool.query('UPDATE produtos SET nome = ?, descricao = ?, data_cadastro = ?, categoria = ?, quantidade = ?, preco = ? WHERE id_produto = ?', [
            dadosAlteracao.nome, dadosAlteracao.descricao, 
            dadosAlteracao.data_cadastro, dadosAlteracao.categoria, 
            dadosAlteracao.quantidade, dadosAlteracao.preco, 
            idProduto])
        res.send(JSON.stringify({id: idProduto, alteracao: 'ok'}));
    } catch (error) {
        throw error
    }
})
/* #### FIM MÉTODOS DO PRODUTO #### */

/* -------------------------------- */

/* #### EXECUÇÃO DA API #### */
app.listen(port, () => {
    console.log('API rodando...')
})


/* #### FUNÇÕES DE CONVERSÃO DE DATA #### */
function converterDataParaBrasil(data){
    data = new Date(data)
    let dia = (data.getDate() < 10 ? '0' : '') + data.getDate();
    let mes = ((data.getMonth()+1) < 10 ? '0' : '') + (data.getMonth() + 1)
    let ano = data.getFullYear()
    let data_brasil = dia + '/' + mes + '/' + ano
    console.log("Convertido de " + data + " para " + data_brasil)
    return data_brasil
}

function converterDataParaISO(data){
    let dia  = data.split("/")[0];
    let mes  = data.split("/")[1];
    let ano  = data.split("/")[2];
    
    data_iso = ano + '-' + mes + '-' + dia
    console.log("Convertido de " + data + " para " + data_iso)
    return data_iso
}

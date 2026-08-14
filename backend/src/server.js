require('dotenv').config()
const express = require('express')
const { consultar } = require('./bot')
const { consultaSchema } = require('./schemas')

const app = express()
const PORT = process.env.PORT ?? 3001
const API_KEY = process.env.API_KEY

app.use(express.json())

// garante que apenas uma consulta roda por vez
let fila = Promise.resolve()

function enfileirar(tarefa) {
  const resultado = fila.then(tarefa, tarefa)
  fila = resultado.catch(() => {})
  return resultado
}

app.post('/consulta', async (req, res) => {
  // 1. confere a chave de acesso
  const chave = req.header('x-api-key')
  if (!API_KEY || chave !== API_KEY) {
    return res.status(401).json({ success: false, error: 'Não autorizado.' })
  }

  // 2. valida os dados recebidos
  const validacao = consultaSchema.safeParse(req.body)
  if (!validacao.success) {
    const mensagem = validacao.error.issues
      .map((issue) => issue.message)
      .join('; ')
    return res.status(400).json({ success: false, error: mensagem })
  }

  // 3. enfileira e realiza a consulta
  try {
    const resultado = await enfileirar(() => consultar(validacao.data))
    const status = resultado.success ? 200 : (resultado.statusCode ?? 500)
    return res.status(status).json(resultado)
  } catch (erro) {
    return res.status(500).json({ success: false, error: erro.message })
  }
})

app.listen(PORT, () => {
  console.log(`API do bot rodando em http://localhost:${PORT}`)
})

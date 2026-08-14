require('dotenv').config()
const { consultar } = require('./bot')

const dados = {
  nome: 'NILCEIA LECHINSKI DA SILVA',
  cpf: '53015240978',
  beneficio: '6164014631',
}

async function main() {
  const resultado = await consultar(dados)
  console.log(JSON.stringify(resultado, null, 2))
}

main()

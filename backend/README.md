# Backend — QualiBank WebScraper

Guia do **backend**, o serviço que controla o robô que consulta benefícios no QualiBank. Tudo explicado de forma simples.

---

## 1. O que este serviço faz?

Recebe pedidos de consulta pela internet (via API), abre um navegador automatizado, faz login no site do QualiBank com as credenciais da sua conta, preenche o formulário e devolve o resultado para quem pediu.

```
Frontend (Next.js)  ──▶  Backend (API)  ──▶  QualiBank (navegador automatizado)
       ▲                                        │
       └─────────── resultado JSON ◀────────────┘
```

---

## 2. Estrutura de pastas

```
backend/
├── .env                → segredos (credenciais, chave da API) — NÃO é commitado
├── .env.example        → modelo com as chaves necessárias
├── package.json        → dependências e comandos (npm start / npm run server)
└── src/
    ├── bot.js          → lógica do robô (login, sessão, consulta)
    ├── schemas.js      → validação dos dados recebidos (Zod)
    ├── server.js       → servidor HTTP (a API em si)
    ├── index.js        → versão de linha de comando (CLI) para testes
    └── cookies.json    → sessão salva do QualiBank — NÃO é commitado
```

---

## 3. Arquivos explicados

### 3.1 `src/bot.js` — o robô

| Função                 | O que faz                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `saveCookies`          | Salva a sessão do QualiBank em `cookies.json` para não logar toda vez.                        |
| `loadCookies`          | Lê `cookies.json` e injeta no navegador.                                                      |
| `isValidSession`       | Abre a página de consulta e vê se não caiu no login (cookies válidos?).                       |
| `validaSession`        | "Porteiro": carrega cookies, valida sessão e apaga o arquivo se expirou.                      |
| `userLogin`            | Preenche usuário e senha, clica em entrar e salva os cookies novos.                           |
| `fillConsultationForm` | Abre o formulário, digita nome/CPF/benefício e clica em "Confirmar".                          |
| `consultar`            | Função principal exportada: abre o navegador, garante sessão, consulta e retorna o resultado. |

A função `consultar(dados)` retorna sempre um **envelope padrão**:

```js
// sucesso
{ success: true, data: { ... }, executionTimeMs: 12345 }

// erro
{ success: false, error: "mensagem", statusCode: 422, executionTimeMs: 12345 }
```

O `statusCode` é `422` (site demorou demais / timeout) ou `500` (erro inesperado). O campo `executionTimeMs` informa o tempo total gasto na consulta (em milissegundos).

### 3.2 `src/schemas.js` — conferência dos pedidos (Zod)

Garante que os dados que chegam são válidos **antes** de acionar o robô:

```js
const consultaSchema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo'),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, '')) // limpa máscara (ex.: 530.152.409-78 → 53015240978)
    .pipe(z.string().length(11, 'CPF inválido')),
  beneficio: z.string().trim().min(1, 'Informe o número do benefício'),
})
```

### 3.3 `src/server.js` — a API

Servidor **Express** que escuta em `http://localhost:3001` e expõe:

```
POST /consulta
```

A cada pedido, faz 3 coisas em ordem:

1. **Confere a chave** — lê o cabeçalho `x-api-key` e compara com `API_KEY` do `.env`. Se ausente ou errada → `401`.
2. **Valida os dados** — usa `consultaSchema`. Se inválidos → `400` com as mensagens.
3. **Enfileira e consulta** — a **fila** garante uma consulta por vez (o formulário do site é interativo e não aceita duas ao mesmo tempo). Devolve o envelope com o resultado.

### 3.4 `src/index.js` — CLI (teste manual)

Faz a mesma consulta, mas sem servidor. Útil para testar o robô isolado:

```bash
npm start
```

---

## 4. Como rodar

### Passo 1 — Criar o `.env`

Copie `.env.example` para `.env` e preencha:

```bash
LOGIN_USUARIO=sua-conta-qualibank
LOGIN_SENHA=sua-senha
API_KEY=uma-chave-secreta-que-voce-escolher
PORT=3001
HEADLESS=true
```

| Variável                        | O que é                                                                     |
| ------------------------------- | --------------------------------------------------------------------------- |
| `LOGIN_USUARIO` / `LOGIN_SENHA` | Credenciais da **sua conta no QualiBank** (fixas, usadas só para o scrape). |
| `API_KEY`                       | A "senha" que o front deve enviar no cabeçalho `x-api-key`.                 |
| `PORT`                          | Porta onde a API sobe (padrão `3001`).                                      |
| `HEADLESS`                      | `true` = navegador escondido; `false` = aparece na tela (para ver o robô).  |

### Passo 2 — Instalar e subir

```bash
cd backend
npm install        # só na primeira vez
npm run server     # sobe a API
```

---

## 5. Contrato da API

| Situação                     | Resposta                                                         | Status |
| ---------------------------- | ---------------------------------------------------------------- | ------ |
| Sucesso                      | `{ "success": true, "data": { ... }, "executionTimeMs": 12345 }` | `200`  |
| Chave errada/ausente         | `{ "success": false, "error": "Não autorizado." }`               | `401`  |
| Dados inválidos              | `{ "success": false, "error": "mensagens" }`                     | `400`  |
| Site não respondeu (timeout) | `{ "success": false, "error": "..." }`                           | `422`  |
| Erro inesperado              | `{ "success": false, "error": "..." }`                           | `500`  |

### Testar com `curl`

```bash
curl -X POST http://localhost:3001/consulta \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{"nome":"NILCEIA LECHINSKI DA SILVA","cpf":"530.152.409-78","beneficio":"6164014631"}'
```

---

## 6. Decisões importantes

- **Sem banco de dados:** as credenciais ficam no `.env` e os resultados são descartados após exibidos.
- **Fila em memória:** uma consulta por vez (necessário pelo site de terceiros).
- **`x-api-key`:** protege a API contra acesso não autorizado.
- **Browser por requisição:** cada consulta abre e fecha um navegador (mais robusto; otimização futura: pool de browsers).

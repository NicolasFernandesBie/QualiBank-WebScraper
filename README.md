# QualiBank WebScraper

Robô que consulta benefícios do INSS no site QualiBank, controlado por uma **API** (backend) e acionado por um **formulário web** (frontend).

```
Formulário (frontend) ──▶ /api/consulta ──▶ API do bot ──▶ QualiBank
        ▲                                            │
        └─────────────── resultado ◀─────────────────┘
```

## Guias de início rápido

| Parte | Guia |
|---|---|
| **Backend** (o bot + API) | [backend/README.md](backend/README.md) |
| **Frontend** (formulário + exibição) | [frontend/README.md](frontend/README.md) |

## Como rodar em 30 segundos

1. `cd backend && npm install && npm run server` — sobe a API do bot (porta 3001).
2. `cd frontend && npm install && npm run dev` — abre o formulário em http://localhost:3000.
3. Configure os `.env` copiando os `.env.example` de cada pasta (credenciais do QualiBank + `API_KEY`).

## Principais decisões

- Credenciais do QualiBank são **fixas** (arquivo `.env` do backend), usadas apenas para o scraping.
- A API é protegida por **`x-api-key`** e processa **1 consulta por vez** (fila).
- **Sem banco de dados por enquanto** — resultados são exibidos e descartados. Banco entra quando houver login de usuários.

# Frontend — QualiBank WebScraper

Guia do **frontend**, a aplicação **Next.js** (React + TypeScript) que mostra o formulário de consulta e exibe o resultado vindo do backend.

---

## 1. O que esta aplicação faz?

É a "cara" do projeto:

1. Mostra um formulário (nome, CPF, benefício).
2. Valida os dados em tempo real (Zod + React Hook Form).
3. Envia para o backend do bot.
4. Exibe o resultado retornado em cards na tela.

```
Usuário digita ──▶ Formulário ──▶ /api/consulta ──▶ Backend do bot ──▶ QualiBank
     ▲                                                                  │
     └─────────────────── resultado exibido em cards ◀──────────────────┘
```

---

## 2. Estrutura de pastas

```
frontend/
├── .env.example        → modelo das variáveis de ambiente
├── package.json        → dependências e comandos
├── tsconfig.json       → configuração do TypeScript
└── app/                → rotas do Next.js (App Router)
│   ├── page.tsx            → página do formulário
│   ├── layout.tsx          → layout raiz (título, idioma)
│   ├── globals.css         → estilos globais (Tailwind)
│   └── api/
│       └── consulta/
│           └── route.ts    → "garçom": encaminha ao bot (com x-api-key)
├── components/         → componentes de interface
│   ├── consulta-form.tsx   → o formulário
│   └── resultado.tsx       → cards do resultado
├── hooks/              → hooks personalizados
│   └── use-consulta-form.ts → lógica do formulário (estado, envio)
├── services/           → camada de API
│   └── consulta-service.ts  → função que chama /api/consulta
├── schemas/            → validação (Zod)
│   └── consulta.ts        → schema do formulário + tipo derivado
└── types/              → tipos do TypeScript
    └── consulta.ts        → formato da resposta do backend
```

---

## 3. Arquivos explicados

### 3.1 `app/api/consulta/route.ts` — o "garçom"

É a ponte entre o front e o backend. Recebe o pedido do formulário e:

1. **Valida os dados** com o mesmo schema Zod do formulário (defesa server-side).
2. **Adiciona a chave** `x-api-key` (lida de `BOT_API_KEY` no `.env`).
3. **Encaminha** para o bot em `BOT_API_URL`.
4. **Repassa** a resposta do bot de volta para o navegador.

### 3.2 `schemas/consulta.ts` — validação (Zod)

Define as regras do formulário:

```ts
export const consultaSchema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo'),
  cpf: z
    .string()
    .transform((valor) => valor.replace(/\D/g, '')) // remove máscara
    .pipe(z.string().length(11, 'CPF inválido')),
  beneficio: z.string().trim().min(1, 'Informe o número do benefício'),
})

export type ConsultaDados = z.infer<typeof consultaSchema>
```

### 3.3 `hooks/use-consulta-form.ts` — a lógica do formulário

Hook personalizado que concentra todo o estado e as ações:

- **React Hook Form** gerencia os campos e a validação (`zodResolver`).
- Máscara de CPF aplicada ao digitar (`setValueAs`).
- Comando `enviar`: chama o service, trata `loading`/`erro` e guarda o `resultado`.
- Expoe `campos`, `errors`, `isValid`, `isSubmitting`, `enviar`, `resultado`, `erro`.

### 3.4 `services/consulta-service.ts` — camada de API

Função que faz o `fetch` para `/api/consulta`:

```ts
export async function consultarBeneficio(
  dados: ConsultaDados,
): Promise<ConsultaResultado> {
  const resposta = await fetch('/api/consulta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  })
  return (await resposta.json()) as ConsultaResultado
}
```

### 3.5 `types/consulta.ts` — o contrato de resposta

```ts
export type ConsultaResultado = {
  success: boolean
  data?: unknown // shape do resultado (será tipado após a 1ª consulta real)
  error?: string
  executionTimeMs?: number // tempo de execução da consulta (enviado pelo bot)
}
```

### 3.7 `components/resultado.tsx` — resultado em seções

Agrupa o JSON em **seções** (Dados Pessoais, Dados bancários, Benefício, Restrições e Exposições, Empréstimos vinculados, Saldos), exibindo cada seção com seu título e os campos em cards. Também mostra o **tempo de execução** da consulta no topo (ex.: `Tempo de execução: 12.3s`), usando o campo `executionTimeMs` do backend.

### 3.8 `utils/resultado.ts` — como o agrupamento funciona

O JSON que o bot retorna usa chaves em **inglês** (ex.: `birthDate`, `benefitNumber`). Para exibir em português, cada campo é mapeado pelo seu **caminho exato** dentro do JSON:

- `agruparPorSecoes(data)` — percorre a configuração `SECOES`, busca o valor de cada campo pelo caminho e monta as seções na ordem desejada.
- **`caminho`** — ex.: `disbursementBankAccount.bank` (chave aninhada com `.`).
- **`label`** — o texto exibido (ex.: "Código do Banco").
- **`formatar`** — função opcional que transforma o valor bruto:
  - `formatarDataNumerica` — `22101964` → `22/10/1964`
  - `formatarDataISO` — `2016-11-14` → `14/11/2016`
  - `formatarMoeda` — `1438.85` → `R$ 1.438,85` (e `R$ -159,86` para negativos)
  - `formatarBooleano` — `true/false` → `Sim/Não`
  - `formatarEnum` — `checking_account` → `Conta Corrente` (via tabela)
  - `formatarConta` — junta `number` + `digit` → `001068615 - 0`
- **Campos fora da lista são ocultados** — só aparecem os campos definidos em `SECOES`.

Para adicionar/renomear campos ou seções, edite a constante `SECOES` no início do arquivo.

### 3.6 `components/` — interface

- `consulta-form.tsx` — o formulário em si (view pura, usa o hook).
- `resultado.tsx` — renderiza as seções agrupadas (a lógica de transformação fica em `utils/resultado.ts`).

---

## 4. Como rodar

### Passo 1 — Criar o `.env.local`

Copie `.env.example` para `.env.local` e preencha:

```bash
BOT_API_URL=http://localhost:3001/consulta
BOT_API_KEY=mesma-chave-do-backend
```

### Passo 2 — Instalar e subir

```bash
cd frontend
npm install    # só na primeira vez
npm run dev    # abre http://localhost:3000
```

> O backend precisa estar rodando (`npm run server` dentro da pasta `backend`) para a consulta funcionar.

---

## 5. Comandos úteis

| Comando         | O que faz                                  |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Sobe o servidor de desenvolvimento         |
| `npm run build` | Gera a versão de produção (verifica tipos) |
| `npm run lint`  | Roda o ESLint (padrão de código)           |
| `npm run start` | Sobe a versão de produção                  |

---

## 6. Dependências principais

| Pacote                | Para que serve                                |
| --------------------- | --------------------------------------------- |
| `next`                | Framework React com App Router e rotas de API |
| `react` / `react-dom` | Biblioteca de interface                       |
| `react-hook-form`     | Gerenciamento de formulários                  |
| `zod`                 | Validação de dados                            |
| `@hookform/resolvers` | Integra o Zod com o React Hook Form           |
| `tailwindcss`         | Estilos utilitários                           |

export type ItemSecao = { label: string; valor: string; tipo?: "moeda" }
export type SecaoRenderizada = { titulo: string; itens: ItemSecao[] }

// busca um valor dentro do JSON por um caminho de chaves (ex.: "a.b.c")
function obterPorCaminho(objeto: unknown, caminho: string): unknown {
  let atual = objeto
  for (const parte of caminho.split(".")) {
    if (
      atual === null ||
      atual === undefined ||
      typeof atual !== "object"
    ) {
      return undefined
    }
    atual = (atual as Record<string, unknown>)[parte]
  }
  return atual
}

// formatadores de valor

// "22101964" -> "22/10/1964"
function formatarDataNumerica(valor: unknown) {
  const texto = String(valor)
  if (texto.length !== 8 || !/^\d+$/.test(texto)) return texto
  return `${texto.slice(0, 2)}/${texto.slice(2, 4)}/${texto.slice(4, 8)}`
}

// "2016-11-14" -> "14/11/2016"
function formatarDataISO(valor: unknown) {
  const partes = String(valor).split("-")
  if (partes.length !== 3) return String(valor)
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

// 1438.85 -> "R$ 1.438,85" | -159.86 -> "R$ -159,86"
function formatarMoeda(valor: unknown) {
  const numero = Number(valor)
  if (Number.isNaN(numero)) return String(valor)
  const numeros = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numero))
  return numero < 0 ? `R$ -${numeros}` : `R$ ${numeros}`
}

function formatarBooleano(valor: unknown) {
  if (valor === true) return "Sim"
  if (valor === false) return "Não"
  return String(valor)
}

// "checking_account" -> "Conta Corrente" (via tabela de traducao)
function formatarEnum(traducoes: Record<string, string>) {
  return (valor: unknown) => {
    const chave = String(valor)
    return traducoes[chave] ?? chave
  }
}

// agrupamento do cartao de beneficio: "001068615" + "0" -> "001068615 - 0"
function formatarConta(valor: unknown) {
  const conta = valor as { number?: unknown; digit?: unknown }
  return `${conta.number ?? ""} - ${conta.digit ?? ""}`
}

// secoes e campos exibidos no resultado (na ordem exata desejada)
type CampoConfig = {
  caminho: string
  label: string
  tipo?: "moeda"
  formatar?: (valor: unknown) => string
}

type SecaoConfig = {
  titulo: string
  campos: CampoConfig[]
}

const SECOES: SecaoConfig[] = [
  {
    titulo: "Dados Pessoais",
    campos: [
      { caminho: "birthDate", label: "Data de Nascimento", formatar: formatarDataNumerica },
      { caminho: "state", label: "UF" },
      { caminho: "politicallyExposedIsPoliticallyExposed", label: "É Politicamente Exposto?", formatar: formatarBooleano },
    ],
  },
  {
    titulo: "Dados bancários",
    campos: [
      { caminho: "disbursementBankAccount.bank", label: "Código do Banco" },
      { caminho: "disbursementBankAccount.branch", label: "Agência" },
      { caminho: "disbursementBankAccount", label: "Conta", formatar: formatarConta },
      { caminho: "creditType", label: "Forma de Pagamento", formatar: formatarEnum({ checking_account: "Conta Corrente" }) },
    ],
  },
  {
    titulo: "Benefício",
    campos: [
      { caminho: "benefitNumber", label: "Número" },
      {
        caminho: "assistanceType",
        label: "Tipo de Assistência",
        formatar: formatarEnum({
          retirement_invalidity_social_security:
            "Aposentadoria por Invalidez - Previdência Social",
        }),
      },
      { caminho: "benefitSituation", label: "Situação do Benefício", formatar: formatarEnum({ active: "Ativo" }) },
      { caminho: "benefitStatus", label: "Status do Benefício", formatar: formatarEnum({ elegible: "Elegível" }) },
      { caminho: "grantDate", label: "Data de Concessão", formatar: formatarDataISO },
      { caminho: "lastInquiryDate", label: "Data da Última Perícia", formatar: formatarDataISO },
    ],
  },
  {
    titulo: "Restrições e Exposições",
    campos: [
      { caminho: "blockType", label: "Tipo de bloqueio", formatar: formatarEnum({ not_blocked: "Sem bloqueio" }) },
      { caminho: "alimony", label: "Pensão alimentícia", formatar: formatarEnum({ not_payer: "Não Pagador" }) },
      { caminho: "hasJudicialConcession", label: "Concessão Judicial", formatar: formatarBooleano },
      { caminho: "hasEntityRepresentation", label: "Representação Legal", formatar: formatarBooleano },
      { caminho: "hasPowerOfAttorney", label: "Possui Procurador?", formatar: formatarBooleano },
    ],
  },
  {
    titulo: "Empréstimos vinculados",
    campos: [
      { caminho: "numberOfActiveSuspendedReservations", label: "Quantidade de empréstimos ativos ou suspensos" },
      { caminho: "numberOfActiveReservations", label: "Quantidade Empréstimos Ativos" },
      { caminho: "numberOfSuspendedReservations", label: "Quantidade Empréstimos Suspensos" },
      { caminho: "numberOfRefinancedReservations", label: "Quantidade Empréstimos Refin." },
      { caminho: "numberOfPortabilities", label: "Quantidade Empréstimos Port." },
    ],
  },
  {
    titulo: "Saldos",
    campos: [
      { caminho: "availableTotalBalance", label: "Saldo Total Disponível", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "usedTotalBalance", label: "Saldo Total Utilizado", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "maxTotalBalance", label: "Saldo Máximo Total", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "consignedCreditBalance", label: "Saldo do Crédito Consignado", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "benefitCardLimit", label: "Limite do cartão de benefício", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "benefitCardBalance", label: "Saldo do cartão de benefício", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "consignedCardLimit", label: "Limite do cartão consignado", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "consignedCardBalance", label: "Saldo do cartão consignado", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "socialBenefitMaxBalance", label: "Saldo máximo do benefício social", tipo: "moeda", formatar: formatarMoeda },
      { caminho: "socialBenefitUsedBalance", label: "Saldo utilizado do benefício social", tipo: "moeda", formatar: formatarMoeda },
    ],
  },
]

// monta as secoes a partir do JSON bruto, usando o caminho exato de cada campo
export function agruparPorSecoes(data: unknown): SecaoRenderizada[] {
  const resultado: SecaoRenderizada[] = []

  for (const secao of SECOES) {
    const itens: ItemSecao[] = []

    for (const campo of secao.campos) {
      const valor = obterPorCaminho(data, campo.caminho)
      if (valor === undefined || valor === null) continue
      const exibicao = campo.formatar ? campo.formatar(valor) : String(valor)
      itens.push({ label: campo.label, valor: exibicao, tipo: campo.tipo })
    }

    if (itens.length > 0) {
      resultado.push({ titulo: secao.titulo, itens })
    }
  }

  return resultado
}

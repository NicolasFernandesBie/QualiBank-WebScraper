export type ConsultaDados = {
  nome: string
  cpf: string
  beneficio: string
}

export type ConsultaResultado = {
  success: boolean
  data?: unknown
  error?: string
}

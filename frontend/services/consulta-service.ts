import type { ConsultaDados } from "@/schemas/consulta"
import type { ConsultaResultado } from "@/types/consulta"

export async function consultarBeneficio(
  dados: ConsultaDados,
): Promise<ConsultaResultado> {
  const resposta = await fetch("/api/consulta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  })

  return (await resposta.json()) as ConsultaResultado
}

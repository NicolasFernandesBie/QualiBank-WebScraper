import type { ConsultaResultado } from "@/lib/types"

type ParValor = { chave: string; valor: string }

function formatarChave(chave: string) {
  return chave.replace(/_/g, " ").replace(/\b\w/g, (letra) => letra.toUpperCase())
}

function achatar(objeto: unknown, prefixo = ""): ParValor[] {
  if (objeto === null || objeto === undefined) {
    return [{ chave: prefixo || "valor", valor: "-" }]
  }

  if (typeof objeto !== "object") {
    return [{ chave: prefixo || "valor", valor: String(objeto) }]
  }

  return Object.entries(objeto).flatMap(([chave, valor]) => {
    const chaveCompleta = prefixo ? `${prefixo}.${chave}` : chave

    if (valor === null || valor === undefined) {
      return [{ chave: chaveCompleta, valor: "-" }]
    }

    if (typeof valor === "object") {
      if (Array.isArray(valor)) {
        const itens = valor as unknown[]
        return itens.length === 0
          ? [{ chave: chaveCompleta, valor: "[]" }]
          : [
              ...itens.flatMap((item, indice) =>
                achatar(item, `${chaveCompleta}[${indice}]`),
              ),
            ]
      }
      return achatar(valor, chaveCompleta)
    }

    return [{ chave: chaveCompleta, valor: String(valor) }]
  })
}

export function Resultado({ resultado }: { resultado: ConsultaResultado }) {
  if (!resultado.success) {
    return null
  }

  const pares = achatar(resultado.data)

  return (
    <div className="mt-6 border-t border-neutral-200 pt-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Resultado</h2>

      {pares.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum dado retornado na consulta.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pares.map((par) => (
            <div
              key={par.chave}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                {formatarChave(par.chave)}
              </p>
              <p className="mt-1 break-words text-sm font-medium text-neutral-900">
                {par.valor}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

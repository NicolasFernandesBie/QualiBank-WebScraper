import type { ConsultaResultado } from "@/types/consulta"
import { achatar, formatarChave } from "@/utils/resultado"

export function Resultado({ resultado }: { resultado: ConsultaResultado }) {
  if (!resultado.success) {
    return null
  }

  const pares = achatar(resultado.data)
  const tempoMs = resultado.executionTimeMs ?? 0
  const tempoExibicao =
    tempoMs >= 1000 ? `${(tempoMs / 1000).toFixed(1)}s` : `${tempoMs}ms`

  return (
    <div className="mt-6 border-t border-neutral-200 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Resultado</h2>
        {tempoMs > 0 && (
          <p className="text-sm text-neutral-500">
            Tempo de execução: <span className="font-medium text-neutral-700">{tempoExibicao}</span>
          </p>
        )}
      </div>

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

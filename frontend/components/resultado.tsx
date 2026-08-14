import type { ConsultaResultado } from '@/types/consulta'
import { agruparPorSecoes } from '@/utils/resultado'

function classeValor(tipo: ItemTipo, valor: string) {
  if (tipo === 'moeda' && valor.startsWith('R$ -')) return 'text-red-600'
  if (tipo === 'moeda') return 'text-emerald-700'
  return 'text-neutral-900'
}

type ItemTipo = 'moeda' | undefined

export function Resultado({ resultado }: { resultado: ConsultaResultado }) {
  if (!resultado.success) {
    return null
  }

  const secoes = agruparPorSecoes(resultado.data)
  const tempoMs = resultado.executionTimeMs ?? 0
  const tempoExibicao =
    tempoMs >= 1000 ? `${(tempoMs / 1000).toFixed(1)}s` : `${tempoMs}ms`

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Resultado da consulta
            </h2>
            <p className="text-sm text-neutral-500">
              Dados do benefício recuperados com sucesso
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tempoMs > 0 && (
            <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
              Tempo de execução:{' '}
              <span className="font-semibold">{tempoExibicao}</span>
            </span>
          )}
        </div>
      </div>

      {secoes.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum dado retornado na consulta.
        </p>
      ) : (
        <div className="space-y-10">
          {secoes.map((secao) => (
            <section key={secao.titulo}>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-blue-500" />
                <h3 className="text-base font-semibold text-neutral-900">
                  {secao.titulo}
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {secao.itens.map((item, indice) => (
                  <div
                    key={`${item.label}-${indice}`}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 transition hover:border-neutral-300 hover:bg-white"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      {item.label}
                    </p>
                    <p
                      className={`mt-1 break-words text-base font-semibold tabular-nums ${classeValor(item.tipo, item.valor)}`}
                    >
                      {item.valor}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

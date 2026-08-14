'use client'

import { useConsultaForm } from '@/hooks/use-consulta-form'
import { Resultado } from '@/components/resultado'

export function ConsultaForm() {
  const { campos, errors, isValid, isSubmitting, enviar, resultado, erro } =
    useConsultaForm()

  return (
    <div className="w-full max-w-5xl">
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold text-neutral-900">
          Consulta in100 Qualibanking
        </h1>
        <p className="mb-6 text-sm text-neutral-500">
          Preencha os dados abaixo para realizar a consulta.
        </p>

        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Nome
            <input
              type="text"
              {...campos.nome}
              placeholder="Nome completo"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-invalid:border-red-500"
              aria-invalid={Boolean(errors.nome)}
            />
            {errors.nome && (
              <span role="alert" className="text-xs text-red-600">
                {errors.nome.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            CPF
            <input
              type="text"
              {...campos.cpf}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-invalid:border-red-500"
              aria-invalid={Boolean(errors.cpf)}
            />
            {errors.cpf && (
              <span role="alert" className="text-xs text-red-600">
                {errors.cpf.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
            Número do Benefício
            <input
              type="text"
              {...campos.beneficio}
              placeholder="Número do benefício"
              inputMode="numeric"
              className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 aria-invalid:border-red-500"
              aria-invalid={Boolean(errors.beneficio)}
            />
            {errors.beneficio && (
              <span role="alert" className="text-xs text-red-600">
                {errors.beneficio.message}
              </span>
            )}
          </label>

          {erro && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            {isSubmitting ? 'Consultando...' : 'Consultar'}
          </button>
        </form>
      </div>

      {resultado && <Resultado resultado={resultado} />}
    </div>
  )
}

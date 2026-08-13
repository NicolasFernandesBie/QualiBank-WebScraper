"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import type { ConsultaDados, ConsultaResultado } from "@/lib/types"
import { Resultado } from "@/components/resultado"

const dadosIniciais: ConsultaDados = {
  nome: "",
  cpf: "",
  beneficio: "",
}

export function ConsultaForm() {
  const [dados, setDados] = useState<ConsultaDados>(dadosIniciais)
  const [resultado, setResultado] = useState<ConsultaResultado | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  function atualizarCampo(campo: keyof ConsultaDados, valor: string) {
    setDados((anterior) => ({ ...anterior, [campo]: valor }))
  }

  function formatarCpf(valor: string) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11)
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setErro(null)
    setResultado(null)
    setCarregando(true)

    try {
      const resposta = await fetch("/api/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })

      const json = (await resposta.json()) as ConsultaResultado

      if (!resposta.ok || !json.success) {
        setErro(json.error ?? "Falha ao realizar a consulta.")
        return
      }

      setResultado(json)
    } catch {
      setErro("Erro de comunicação com o servidor.")
    } finally {
      setCarregando(false)
    }
  }

  const camposPreenchidos =
    dados.nome.trim() !== "" &&
    dados.cpf.replace(/\D/g, "").length === 11 &&
    dados.beneficio.trim() !== ""

  return (
    <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900">
        Consulta de Benefício
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Preencha os dados abaixo para realizar a consulta.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Nome
          <input
            type="text"
            value={dados.nome}
            onChange={(evento) => atualizarCampo("nome", evento.target.value)}
            placeholder="Nome completo"
            required
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          CPF
          <input
            type="text"
            value={dados.cpf}
            onChange={(evento) =>
              atualizarCampo("cpf", formatarCpf(evento.target.value))
            }
            placeholder="000.000.000-00"
            required
            inputMode="numeric"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-neutral-700">
          Número do Benefício
          <input
            type="text"
            value={dados.beneficio}
            onChange={(evento) => atualizarCampo("beneficio", evento.target.value)}
            placeholder="Número do benefício"
            required
            inputMode="numeric"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
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
          disabled={carregando || !camposPreenchidos}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {carregando ? "Consultando..." : "Consultar"}
        </button>
      </form>

      {resultado && <Resultado resultado={resultado} />}
    </div>
  )
}

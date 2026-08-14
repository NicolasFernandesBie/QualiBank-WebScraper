"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { consultaSchema, type ConsultaDados } from "@/schemas/consulta"
import type { ConsultaResultado } from "@/types/consulta"
import { consultarBeneficio } from "@/services/consulta-service"

export function useConsultaForm() {
  const { register, handleSubmit, formState } = useForm<ConsultaDados>({
    resolver: zodResolver(consultaSchema),
    mode: "onChange",
    defaultValues: { nome: "", cpf: "", beneficio: "" },
  })

  const [resultado, setResultado] = useState<ConsultaResultado | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function formatarCpf(valor: string) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11)
    return digitos
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const enviar = handleSubmit(async (dados) => {
    setErro(null)
    setResultado(null)

    try {
      const json = await consultarBeneficio(dados)

      if (!json.success) {
        setErro(json.error ?? "Falha ao realizar a consulta.")
        return
      }

      setResultado(json)
    } catch {
      setErro("Erro de comunicação com o servidor.")
    }
  })

  return {
    campos: {
      nome: register("nome"),
      cpf: register("cpf", { setValueAs: formatarCpf }),
      beneficio: register("beneficio"),
    },
    errors: formState.errors,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    enviar,
    resultado,
    erro,
  }
}

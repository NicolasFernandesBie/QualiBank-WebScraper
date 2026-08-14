import { NextRequest, NextResponse } from "next/server"
import { consultaSchema } from "@/schemas/consulta"
import type { ConsultaResultado } from "@/types/consulta"

const BOT_API_URL =
  process.env.BOT_API_URL ?? "http://localhost:3001/consulta"
const BOT_API_KEY = process.env.BOT_API_KEY

export async function POST(req: NextRequest) {
  try {
    const corpo = await req.json()

    // 1. valida os dados recebidos do formulario
    const validacao = consultaSchema.safeParse(corpo)
    if (!validacao.success) {
      const mensagem = validacao.error.issues
        .map((issue) => issue.message)
        .join("; ")
      return NextResponse.json(
        { success: false, error: mensagem },
        { status: 400 },
      )
    }

    // 2. encaminha para o bot com a chave de acesso
    const resposta = await fetch(BOT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": BOT_API_KEY ?? "",
      },
      body: JSON.stringify(validacao.data),
      signal: AbortSignal.timeout(120_000),
    })

    const json = (await resposta.json()) as ConsultaResultado
    return NextResponse.json(json, { status: resposta.status })
  } catch (erro) {
    const mensagem =
      erro instanceof Error ? erro.message : "Falha ao contatar o bot."
    return NextResponse.json(
      { success: false, error: mensagem },
      { status: 502 },
    )
  }
}

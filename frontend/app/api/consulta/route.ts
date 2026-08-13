import { NextRequest, NextResponse } from "next/server"
import type { ConsultaResultado } from "@/lib/types"

const BOT_API_URL =
  process.env.BOT_API_URL ?? "http://localhost:3001/consulta"

export async function POST(req: NextRequest) {
  try {
    const corpo = await req.json()

    const resposta = await fetch(BOT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
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

export type ParValor = { chave: string; valor: string }

export function formatarChave(chave: string) {
  return chave
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase())
}

export function achatar(objeto: unknown, prefixo = ""): ParValor[] {
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

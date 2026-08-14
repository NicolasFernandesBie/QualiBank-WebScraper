import { z } from "zod"

export const consultaSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z
    .string()
    .transform((valor) => valor.replace(/\D/g, ""))
    .pipe(z.string().length(11, "CPF inválido")),
  beneficio: z.string().trim().min(1, "Informe o número do benefício"),
})

export type ConsultaDados = z.infer<typeof consultaSchema>

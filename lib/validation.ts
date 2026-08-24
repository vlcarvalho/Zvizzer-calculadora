import { z } from "zod";

/**
 * Validações do wizard (spec §27): sem divisões por zero, sem negativos,
 * sem campos obrigatórios vazios — mensagens em linguagem simples.
 */

export const volumePrecoSchema = z.object({
  polimentosMes: z
    .number({ message: "Informe quantos polimentos você realiza por mês." })
    .positive({ message: "Informe quantos polimentos você realiza por mês." }),
  precoMedioPolimento: z
    .number({ message: "Informe quanto você cobra, em média, por polimento." })
    .positive({ message: "Informe quanto você cobra, em média, por polimento." }),
  horasAtuais: z
    .number({ message: "Informe quantas horas você leva para realizar o polimento." })
    .positive({ message: "Informe quantas horas você leva para realizar o polimento." }),
});
export type VolumePrecoInput = z.infer<typeof volumePrecoSchema>;

export const proprietarioSchema = z.object({
  papel: z.literal("proprietario"),
  proLabore: z
    .number({ message: "Informe quanto você precisa retirar por mês." })
    .positive({ message: "Informe quanto você precisa retirar por mês." }),
  horasSemanais: z
    .number({ message: "Informe quantas horas você trabalha por semana." })
    .positive({ message: "Informe quantas horas você trabalha por semana." }),
});

export const colaboradorSchema = z.object({
  papel: z.literal("colaborador"),
  salarioBruto: z
    .number({ message: "Informe o salário bruto mensal." })
    .positive({ message: "Informe o salário bruto mensal." }),
  beneficios: z
    .number({ message: "Informe os benefícios mensais (pode ser 0)." })
    .min(0, { message: "Os benefícios não podem ser negativos." }),
  horasSemanais: z
    .number({ message: "Informe a jornada semanal." })
    .positive({ message: "Informe a jornada semanal." }),
});

export const membroSchema = z.discriminatedUnion("papel", [
  proprietarioSchema,
  colaboradorSchema,
]);
export type MembroFormInput = z.infer<typeof membroSchema>;

export const compostoSchema = z.object({
  nome: z.string().optional(),
  precoEmbalagem: z
    .number({ message: "Informe o preço da embalagem do composto." })
    .positive({ message: "Informe o preço da embalagem do composto." }),
  quantidadeEmbalagemG: z
    .number({ message: "Informe a quantidade da embalagem em gramas." })
    .positive({ message: "A quantidade da embalagem não pode ser zero." }),
  consumoCarroG: z
    .number({ message: "Informe o consumo médio por carro em gramas." })
    .positive({ message: "Informe o consumo médio por carro em gramas." }),
});
export type CompostoFormInput = z.infer<typeof compostoSchema>;

export const boinaSchema = z.object({
  nome: z.string().optional(),
  quantidade: z
    .number({ message: "Informe a quantidade de boinas utilizadas." })
    .positive({ message: "Informe a quantidade de boinas utilizadas." }),
  precoUnitario: z
    .number({ message: "Informe o preço de cada boina." })
    .positive({ message: "Informe o preço de cada boina." }),
  durabilidadeCarros: z
    .number({ message: "Informe quantos carros esse conjunto atende." })
    .positive({ message: "A durabilidade não pode ser zero." }),
});
export type BoinaFormInput = z.infer<typeof boinaSchema>;

export const resellerSchema = z.object({
  nome: z.string().min(1, { message: "Informe o nome da loja." }),
  cidade: z.string().min(1, { message: "Informe a cidade." }),
  estado: z
    .string()
    .length(2, { message: "Use a sigla do estado (ex.: SP)." })
    .toUpperCase(),
  whatsapp: z
    .string()
    .min(10, { message: "Informe um WhatsApp válido com DDD." }),
  ativo: z.boolean().default(true),
});
export type ResellerFormInput = z.infer<typeof resellerSchema>;

export const zvizzerSettingsSchema = z.object({
  compostoNome: z.string().min(1, { message: "Informe o nome do composto." }),
  compostoPreco: z.number().positive(),
  compostoPesoG: z.number().positive(),
  compostoConsumoG: z.number().positive(),
  boinaNome: z.string().min(1, { message: "Informe o nome da boina." }),
  boinaPreco: z.number().positive(),
  boinaQuantidade: z.number().positive(),
  boinaDurabilidadeCarros: z.number().positive(),
  tempoProcessoMinutos: z.number().positive(),
});

export const laborSettingsSchema = z.object({
  encargosPatronaisPct: z.number().min(0),
  fgtsPct: z.number().min(0),
  decimoTerceiroPct: z.number().min(0),
  feriasPct: z.number().min(0),
  adicionalFeriasPct: z.number().min(0),
  outrosEncargosPct: z.number().min(0),
});

export const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  senha: z.string().min(1, { message: "Informe a senha." }),
});

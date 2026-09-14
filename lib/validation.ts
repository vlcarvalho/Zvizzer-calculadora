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
  profissionaisSimultaneos: z
    .number({ message: "Selecione quantos profissionais trabalham ao mesmo tempo." })
    .positive({ message: "Selecione quantos profissionais trabalham ao mesmo tempo." }),
});
export type VolumePrecoInput = z.infer<typeof volumePrecoSchema>;

/** Custos fixos mensais da operação (etapa 2). Só o pró-labore/salário é
 * obrigatório — aluguel, funcionários e demais despesas podem ser 0 numa
 * operação enxuta (autônomo que trabalha em casa, por exemplo). */
export const custosFixosSchema = z.object({
  salarioProLabore: z
    .number({ message: "Informe quanto você retira por mês (salário ou pró-labore)." })
    .positive({ message: "Informe quanto você retira por mês (salário ou pró-labore)." }),
  aluguel: z
    .number({ message: "Informe o aluguel (pode ser 0)." })
    .min(0, { message: "O aluguel não pode ser negativo." }),
  custoFuncionarios: z
    .number({ message: "Informe o custo com funcionários (pode ser 0)." })
    .min(0, { message: "O custo com funcionários não pode ser negativo." }),
  demaisDespesas: z
    .number({ message: "Informe as demais despesas (pode ser 0)." })
    .min(0, { message: "As demais despesas não podem ser negativas." }),
});
export type CustosFixosFormInput = z.infer<typeof custosFixosSchema>;

export const compostoSchema = z.object({
  nome: z.string().trim().min(1, { message: "Dê um nome para o composto." }),
  precoEmbalagem: z
    .number({ message: "Informe o preço do produto." })
    .positive({ message: "Informe o preço do produto." }),
  quantidadeEmbalagemG: z
    .number({ message: "Selecione a quantidade da embalagem." })
    .positive({ message: "Selecione a quantidade da embalagem." }),
  consumoCarroG: z
    .number({ message: "Selecione o consumo médio por carro." })
    .positive({ message: "Selecione o consumo médio por carro." }),
});
export type CompostoFormInput = z.infer<typeof compostoSchema>;

export const boinaSchema = z.object({
  tipo: z.string().trim().min(1, { message: "Selecione o tipo da boina." }),
  nome: z.string().trim().min(1, { message: "Dê um nome para a boina." }),
  quantidade: z
    .number({ message: "Selecione a quantidade de boinas." })
    .positive({ message: "Selecione a quantidade de boinas." }),
  precoUnitario: z
    .number({ message: "Informe o preço de cada boina." })
    .positive({ message: "Informe o preço de cada boina." }),
  durabilidadeCarros: z
    .number({ message: "Selecione quantos carros esse conjunto atende." })
    .positive({ message: "Selecione quantos carros esse conjunto atende." }),
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
  cep: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? null : (v ?? null))),
  // logoUrl não entra aqui de propósito: quem controla esse campo é o upload
  // de imagem. Se ele viesse do formulário, salvar um revendedor sem mexer na
  // logo apagaria a que já estava lá.
  latitude: z
    .number()
    .min(-90)
    .max(90)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  longitude: z
    .number()
    .min(-180)
    .max(180)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
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
});

export const masterTrainerSchema = z.object({
  nome: z.string().trim().min(1, { message: "Informe o nome do Master Trainer." }),
  fotoUrl: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? null : (v ?? null))),
  miniCv: z.string().trim().min(1, { message: "Informe o mini-CV." }),
  ordem: z.number().int().min(0).default(0),
  ativo: z.boolean().default(true),
});
export type MasterTrainerFormInput = z.infer<typeof masterTrainerSchema>;

export const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido." }),
  senha: z.string().min(1, { message: "Informe a senha." }),
});

import Link from "next/link";
import type { Metadata } from "next";
import { CONTROLADOR, POLITICA_VERSAO } from "@/lib/privacidade";

export const metadata: Metadata = {
  title: "Política de Privacidade | Calculadora de Custo de Polimento",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 sm:py-16">
      <Link href="/" className="text-sm text-muted underline underline-offset-4">
        ← Voltar
      </Link>

      <h1 className="mt-6 text-3xl font-black tracking-tight">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-muted">
        Versão {POLITICA_VERSAO}. Esta política explica como tratamos seus dados nesta
        calculadora, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
      </p>

      <Secao titulo="1. Quem é o responsável pelos dados">
        <p>
          O controlador dos dados é <strong>{CONTROLADOR.nome}</strong> ({CONTROLADOR.razaoSocial},
          CNPJ {CONTROLADOR.cnpj}). Para qualquer assunto sobre privacidade, fale com{" "}
          {CONTROLADOR.emailContato}. Encarregado (DPO): {CONTROLADOR.encarregado}.
        </p>
      </Secao>

      <Secao titulo="2. O que a calculadora NÃO envia para nós">
        <p>
          Os valores que você digita para calcular — salário/pró-labore, aluguel, custo com
          funcionários, demais despesas, preços de produtos — <strong>ficam apenas no seu
          navegador</strong>, para você não perder o preenchimento se atualizar a página. Esses
          números não são enviados nem armazenados em nossos servidores. Você pode apagá-los a
          qualquer momento limpando os dados do site no navegador ou clicando em &quot;Fazer novo
          cálculo&quot;.
        </p>
      </Secao>

      <Secao titulo="3. Quais dados coletamos">
        <p className="font-semibold text-foreground">a) Contato, se você quiser deixar</p>
        <p>
          No fim do resultado você pode, de forma totalmente opcional, informar{" "}
          <strong>e-mail e WhatsApp</strong>. Junto deles guardamos um resumo do seu resultado
          (quantidade de polimentos por mês, custo por carro atual e com Zvizzer, economia mensal
          e horas liberadas), além da data e do texto do consentimento que você aceitou.
        </p>
        <p className="mt-3 font-semibold text-foreground">b) Uso da ferramenta (sem identificação)</p>
        <p>
          Registramos um identificador aleatório do seu navegador e eventos de uso (abriu a
          calculadora, concluiu o cálculo, clicou no WhatsApp de um revendedor) para entendermos
          se a ferramenta está sendo útil. Esse identificador <strong>não tem nome, e-mail nem
          telefone</strong> e não é usado para te identificar. Não usamos Google Analytics, Meta
          Pixel nem cookies de rastreamento de terceiros.
        </p>
      </Secao>

      <Secao titulo="4. Para que usamos e com qual base legal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Contato comercial e envio de conteúdos:</strong> com base no seu{" "}
            <strong>consentimento</strong> (art. 7º, I), dado ao marcar a caixa de aceite. Você
            pode revogar quando quiser.
          </li>
          <li>
            <strong>Medir e melhorar a ferramenta:</strong> com base no{" "}
            <strong>legítimo interesse</strong> (art. 7º, IX), usando apenas dados que não
            identificam você.
          </li>
        </ul>
      </Secao>

      <Secao titulo="5. Com quem compartilhamos">
        <p>
          Não vendemos seus dados. Quando você clica em &quot;Falar no WhatsApp&quot; de um
          revendedor, quem inicia a conversa é você, pelo seu próprio WhatsApp — não enviamos
          seus dados ao revendedor automaticamente. Usamos fornecedores de hospedagem e banco de
          dados apenas para manter o serviço no ar, e o mapa é exibido com OpenStreetMap.
        </p>
      </Secao>

      <Secao titulo="6. Por quanto tempo guardamos">
        <p>
          Mantemos seu contato enquanto durar o relacionamento ou até você pedir a exclusão. Os
          dados de uso sem identificação podem ser mantidos de forma agregada para estatísticas.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos">
        <p>
          A LGPD (art. 18) garante que você possa pedir: confirmação de que tratamos seus dados,
          acesso a eles, correção, anonimização ou exclusão, portabilidade, informação sobre
          compartilhamento e <strong>revogação do consentimento</strong>. É só escrever para{" "}
          {CONTROLADOR.emailContato} — atendemos sem custo.
        </p>
      </Secao>

      <Secao titulo="8. Segurança">
        <p>
          O acesso administrativo é protegido por senha e os dados trafegam por conexão
          criptografada. Nenhum sistema é 100% seguro, mas adotamos medidas compatíveis com o
          volume e a sensibilidade dos dados tratados aqui.
        </p>
      </Secao>

      <Secao titulo="9. Mudanças nesta política">
        <p>
          Se o texto mudar, publicamos uma nova versão nesta página. Guardamos qual versão você
          aceitou, para ficar claro a que você consentiu.
        </p>
      </Secao>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-lg font-bold">{titulo}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

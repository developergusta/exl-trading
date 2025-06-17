"use client"

export function EconomicCalendar() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendário Econômico</h1>
        <p className="text-gray-400">Acompanhe eventos econômicos importantes</p>
      </div>

      <div className="bg-[#2A2B2A] p-5 rounded">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <iframe
              src="https://sslecal2.investing.com?ecoDayBackground=%23b6fa17&borderColor=%23080707&ecoDayFontColor=%23000000&columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=32,5,36&calType=day&timeZone=12&lang=12"
              width="100%"
              height="600"
              frameBorder="0"
              allowTransparency={true}
              marginWidth={0}
              marginHeight={0}
              className="rounded border-0"
              title="Calendário Econômico"
            />
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          <span>
            Calendário Econômico fornecido por{" "}
            <a
              href="https://br.investing.com/"
              rel="noreferrer nofollow"
              target="_blank"
              className="text-[#BBF717] font-bold underline hover:text-[#9FD615]"
            >
              Investing.com Brasil
            </a>
            , o portal líder financeiro.
          </span>
        </div>

        {/* Informações sobre o calendário */}
        <div className="mt-5 space-y-3">
          <h3 className="text-lg font-bold text-[#BBF717]">Como usar o Calendário Econômico</h3>
          <ul className="space-y-2 text-sm">
            <li>
              • <strong>Importância:</strong> Eventos marcados com 🔴 têm alto impacto no mercado
            </li>
            <li>
              • <strong>Atual:</strong> Valor real divulgado do indicador econômico
            </li>
            <li>
              • <strong>Previsão:</strong> Expectativa dos analistas para o indicador
            </li>
            <li>
              • <strong>Anterior:</strong> Valor do período anterior para comparação
            </li>
            <li>
              • <strong>Países:</strong> Foco em EUA, Brasil e principais economias mundiais
            </li>
          </ul>

          <div className="bg-black p-3 rounded mt-4">
            <h4 className="font-bold text-[#BBF717] mb-2">⚠️ Dica de Trading</h4>
            <p className="text-sm">
              Eventos de alta importância podem causar alta volatilidade nos mercados. Considere ajustar seu tamanho de
              posição ou evitar trades próximo aos horários desses eventos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

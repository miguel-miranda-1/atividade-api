async function buscarEDisparar() {

            const inputOriginal = document.getElementById('cepInput').value;

            const status = document.getElementById('statusSistema-a');

            const cep = inputOriginal.replace(/\D/g, '');

            if (cep.length !== 8) {

                status.innerText =
                " Erro: O CEP deve ter exatamente 8 números.";

                return;
            }

            status.innerText = "🔎 Consultando ViaCEP...";

            try {

                const url = `https://viacep.com.br/ws/${cep}/json/`;

                const response = await fetch(url);

                const dadosCep = await response.json();

                if (dadosCep.erro === true) {

                    status.innerText =
                    "Erro: Este CEP não existe.";

                    return;
                }

                status.innerText =
                "Endereço encontrado! Disparando webhook...";

                const payloadWebhook = {

                    evento: "cliente.endereco.atualizado",

                    timestamp: new Date().toISOString(),

                    dados: {
                        logradouro: dadosCep.logradouro || "Não informado",
                        bairro: dadosCep.bairro || "Não informado",
                        cidade: dadosCep.localidade,
                        uf: dadosCep.uf
                    }
                };

                const eventoWebhook = new CustomEvent(
                    'webhook_endpoint',
                    {
                        detail: payloadWebhook
                    }
                );

                setTimeout(() => {

                    window.dispatchEvent(eventoWebhook);

                    status.innerText =
                    " Sucesso! Webhook enviado para o Sistema B.";

                }, 1000);

            } catch (error) {

                status.innerText =
                "Erro crítico de rede ou API fora do ar.";

                console.error(error);
            }
        }

        window.addEventListener(
            'webhook_endpoint',

            function (evento) {

                const detalhesCep = evento.detail;

                const resultado =
                document.getElementById('logWebhook');

                resultado.innerText = JSON.stringify(
                    detalhesCep,
                    null,
                    2
                );
            }
        );
var RHContractView = {

    instanceId: null,
    registros: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Contratos inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhContractExportar_" + instanceId,
            "#rhContractCaptura_" + instanceId,
            "contratos"
        );

        var tabelasExportacao = [
            {
                titulo: "Próximos Vencimentos",
                seletor: $("#rhContractTabelaVencimentos_" + instanceId).closest("table")[0]
            }
        ];

        RHPdfExport.bind(
            "#rhContractGerarPdf_" + instanceId,
            "contratos_tabela",
            "Contratos - Próximos Vencimentos",
            tabelasExportacao
        );

        RHXlsxExport.bind(
            "#rhContractGerarXlsx_" + instanceId,
            "contratos_tabela",
            tabelasExportacao
        );
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();
        var registros = RHContractService.buscar(filtros);

        console.log("[RH Estratégico] Dados de Contratos:", registros);

        this.registros = registros;

        var resumo = RHContractService.calcularResumo(registros);

        $("#rhContractAtivos_" + this.instanceId).text(resumo.determinadosAtivos);
        $("#rhContractExpirando_" + this.instanceId).text(resumo.prestesAExpirar);
        $("#rhContractExpirados_" + this.instanceId).text(resumo.expirados);
        $("#rhContractIndeterminados_" + this.instanceId).text(resumo.indeterminados);
        $("#rhContractPermanenciaMedia_" + this.instanceId).text(resumo.permanenciaMedia);

        var porStatus = RHContractService.agruparPorStatus(registros);
        var statusOrdenado = ["Ativo", "Prestes a Expirar", "Expirado", "Indeterminado"];

        var porTipo = RHContractService.agruparPorTipo(registros);
        var tiposOrdenados = Object.keys(porTipo).sort(function (a, b) {
            return porTipo[b] - porTipo[a];
        });

        RHCharts.renderContract(this.instanceId, {
            status: {
                labels: statusOrdenado,
                valores: statusOrdenado.map(function (status) {
                    return porStatus[status] || 0;
                })
            },
            tipo: {
                labels: tiposOrdenados,
                valores: tiposOrdenados.map(function (tipo) {
                    return porTipo[tipo];
                })
            }
        });

        this.renderTabelaVencimentos(
            RHContractService.proximosVencimentos(registros, 10)
        );

        RHDrilldown.fechar("#rhContractDrilldown_" + this.instanceId);
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhContract_" + this.instanceId,
            "#rhContractDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registros) {
            return null;
        }

        var servico = RHContractService;
        var hoje = new Date();
        var limite = new Date(hoje);
        limite.setDate(hoje.getDate() + servico.LIMITE_DIAS_EXPIRACAO);

        var filtros = {
            ativos: function (item) {
                var status = servico.calcularStatus(item, hoje, limite);
                return status === "Ativo" || status === "Prestes a Expirar";
            },
            expirando: function (item) {
                return servico.calcularStatus(item, hoje, limite) === "Prestes a Expirar";
            },
            expirados: function (item) {
                return servico.calcularStatus(item, hoje, limite) === "Expirado";
            },
            indeterminados: function (item) {
                return servico.classificarTipo(item) === "Indeterminado";
            },
            permanenciaMedia: function (item) {
                return servico.classificarTipo(item) !== "Indeterminado";
            }
        };

        var titulos = {
            ativos: "Contratos Determinados Ativos",
            expirando: "Contratos Prestes a Expirar",
            expirados: "Contratos Expirados",
            indeterminados: "Contratos Indeterminados",
            permanenciaMedia: "Contratos Determinados (Admissão x Término)"
        };

        if (!filtros[chave]) {
            return null;
        }

        var linhas = this.registros
            .filter(filtros[chave])
            .map(function (item) {
                return {
                    nome: item.NOME,
                    funcao: item.FUNCAO || "-",
                    tipo: servico.classificarTipo(item),
                    admissao: item.ADMISSAO || "-",
                    fim: item.FIM_CONTRATO || "-",
                    status: servico.calcularStatus(item, hoje, limite)
                };
            });

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "nome", rotulo: "Colaborador" },
                { campo: "funcao", rotulo: "Função" },
                { campo: "tipo", rotulo: "Tipo" },
                { campo: "admissao", rotulo: "Admissão" },
                { campo: "fim", rotulo: "Fim Contrato" },
                { campo: "status", rotulo: "Status" }
            ],
            linhas: linhas
        };
    },

    renderTabelaVencimentos: function (registros) {
        var corpo = $("#rhContractTabelaVencimentos_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 5, "class": "rh-table-empty", text: "Nenhum contrato vencendo em breve" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.funcao));
            linha.append($("<td>").text(item.tipo));
            linha.append($("<td>").text(item.fimTexto));
            linha.append($("<td>").text(item.diasRestantes));

            corpo.append(linha);
        });
    }

};

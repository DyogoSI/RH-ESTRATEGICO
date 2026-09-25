var RHVacationView = {

    instanceId: null,
    registrosSaldo: null,
    registrosMarcadas: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Férias inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhVacationExportar_" + instanceId,
            "#rhVacationCaptura_" + instanceId,
            "ferias"
        );

        var tabelasExportacao = [
            {
                titulo: "Próximos Vencimentos",
                seletor: $("#rhVacationTabelaVencimentos_" + instanceId).closest("table")[0]
            },
            {
                titulo: "De Férias Agora",
                seletor: $("#rhVacationTabelaAgora_" + instanceId).closest("table")[0]
            }
        ];

        RHPdfExport.bind(
            "#rhVacationGerarPdf_" + instanceId,
            "ferias_tabelas",
            "Férias - Tabelas Detalhadas",
            tabelasExportacao
        );

        RHXlsxExport.bind(
            "#rhVacationGerarXlsx_" + instanceId,
            "ferias_tabelas",
            tabelasExportacao
        );
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();

        var registrosSaldo = RHVacationService.buscarSaldo(filtros);
        var registrosMarcadas = RHVacationService.buscarMarcadas(filtros);

        this.registrosSaldo = registrosSaldo;
        this.registrosMarcadas = registrosMarcadas;

        console.log("[RH Estratégico] Dados de Férias (saldo):", registrosSaldo);
        console.log("[RH Estratégico] Dados de Férias (marcadas):", registrosMarcadas);

        var resumo = RHVacationService.calcularResumo(registrosSaldo, registrosMarcadas);

        $("#rhVacationTotal_" + this.instanceId).text(resumo.totalColaboradores);
        $("#rhVacationSaldoMedio_" + this.instanceId).text(resumo.saldoMedio);
        $("#rhVacationVencendo_" + this.instanceId).text(resumo.vencendoEm30);
        $("#rhVacationAgora_" + this.instanceId).text(resumo.deFeriasAgora);

        var porSecao = RHVacationService.agruparSaldoPorSecao(registrosSaldo);

        var secoesOrdenadas = Object.keys(porSecao)
            .sort(function (a, b) {
                return porSecao[b] - porSecao[a];
            })
            .slice(0, 8);

        var porSituacao = RHVacationService.agruparMarcadasPorSituacao(registrosMarcadas);
        var situacoes = Object.keys(porSituacao);

        RHCharts.renderVacation(this.instanceId, {
            secao: {
                labels: secoesOrdenadas,
                valores: secoesOrdenadas.map(function (secao) {
                    return porSecao[secao];
                })
            },
            situacao: {
                labels: situacoes,
                valores: situacoes.map(function (situacao) {
                    return porSituacao[situacao];
                })
            }
        });

        this.renderTabelaVencimentos(
            RHVacationService.proximosVencimentos(registrosSaldo, 10)
        );

        this.renderTabelaAgora(
            RHVacationService.colaboradoresDeFerias(registrosMarcadas)
        );

        RHDrilldown.fechar("#rhVacationDrilldown_" + this.instanceId);
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhVacation_" + this.instanceId,
            "#rhVacationDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registrosSaldo) {
            return null;
        }

        if (chave === "total" || chave === "saldoMedio") {
            return {
                titulo: chave === "total" ? "Colaboradores com Saldo de Férias" : "Saldo de Férias por Colaborador",
                colunas: [
                    { campo: "nome", rotulo: "Colaborador" },
                    { campo: "secao", rotulo: "Seção" },
                    { campo: "saldo", rotulo: "Saldo" }
                ],
                linhas: this.registrosSaldo.map(function (item) {
                    return {
                        nome: item.NOME,
                        secao: item["SEÇÃO"] || "-",
                        saldo: RHVacationService.parseNumero(item.SALDO)
                    };
                })
            };
        }

        if (chave === "vencendo") {
            var hoje = new Date();
            var em30Dias = new Date();
            em30Dias.setDate(hoje.getDate() + 30);

            var linhasVencendo = this.registrosSaldo
                .map(function (item) {
                    var vencimentoData = RHVacationService.parseData(item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"]);

                    return {
                        nome: item.NOME,
                        secao: item["SEÇÃO"] || "-",
                        saldo: RHVacationService.parseNumero(item.SALDO),
                        vencimentoTexto: item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"] || "-",
                        vencimentoData: vencimentoData
                    };
                })
                .filter(function (item) {
                    return item.vencimentoData !== null
                        && item.vencimentoData >= hoje
                        && item.vencimentoData <= em30Dias;
                })
                .sort(function (a, b) {
                    return a.vencimentoData - b.vencimentoData;
                });

            return {
                titulo: "Colaboradores Vencendo em 30 Dias",
                colunas: [
                    { campo: "nome", rotulo: "Colaborador" },
                    { campo: "secao", rotulo: "Seção" },
                    { campo: "saldo", rotulo: "Saldo" },
                    { campo: "vencimentoTexto", rotulo: "Vencimento" }
                ],
                linhas: linhasVencendo
            };
        }

        if (chave === "agora") {
            return {
                titulo: "Colaboradores de Férias Agora",
                colunas: [
                    { campo: "nome", rotulo: "Colaborador" },
                    { campo: "secao", rotulo: "Seção" },
                    { campo: "inicio", rotulo: "Início" },
                    { campo: "fim", rotulo: "Fim" }
                ],
                linhas: RHVacationService.colaboradoresDeFerias(this.registrosMarcadas)
            };
        }

        return null;
    },

    renderTabelaVencimentos: function (registros) {
        var corpo = $("#rhVacationTabelaVencimentos_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 4, "class": "rh-table-empty", text: "Nenhum vencimento próximo" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.secao));
            linha.append($("<td>").text(item.saldo));
            linha.append($("<td>").text(item.vencimentoTexto));

            corpo.append(linha);
        });
    },

    renderTabelaAgora: function (registros) {
        var corpo = $("#rhVacationTabelaAgora_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 4, "class": "rh-table-empty", text: "Nenhum colaborador de férias no momento" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.secao));
            linha.append($("<td>").text(item.inicio));
            linha.append($("<td>").text(item.fim));

            corpo.append(linha);
        });
    }

};

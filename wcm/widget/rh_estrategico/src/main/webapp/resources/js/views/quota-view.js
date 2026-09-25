var RHQuotaView = {

    instanceId: null,
    dados: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Cotas inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhQuotaExportar_" + instanceId,
            "#rhQuotaCaptura_" + instanceId,
            "cotas"
        );

        this.bindGerarPdf();
        this.bindGerarXlsx();
    },

    montarTabelasExportacao: function () {
        var d = this.dados || { pcd: [], aprendiz: [] };

        return [
            {
                titulo: "Cumprimento PCD por Filial",
                colunas: [
                    { campo: "nomeColigada", rotulo: "Coligada" },
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" },
                    { campo: "atual", rotulo: "PCD Atuais" },
                    { campo: "cota", rotulo: "Cota" },
                    { campo: "faltante", rotulo: "Faltante" },
                    { campo: "percentualTexto", rotulo: "% Cumprimento" },
                    { campo: "status", rotulo: "Status" }
                ],
                linhas: d.pcd
            },
            {
                titulo: "Cumprimento Aprendiz por Filial",
                colunas: [
                    { campo: "nomeColigada", rotulo: "Coligada" },
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" },
                    { campo: "minimo", rotulo: "Mínimo" },
                    { campo: "maximo", rotulo: "Máximo" },
                    { campo: "atual", rotulo: "Atual" },
                    { campo: "faltante", rotulo: "Faltante" },
                    { campo: "percentualTexto", rotulo: "% Cumprimento" },
                    { campo: "status", rotulo: "Status" }
                ],
                linhas: d.aprendiz
            },
            {
                titulo: "Aprendizes com Contrato Vencendo",
                seletor: $("#rhQuotaTabelaVencimentos_" + this.instanceId).closest("table")[0]
            }
        ];
    },

    bindGerarPdf: function () {
        var that = this;
        var botao = $("#rhQuotaGerarPdf_" + this.instanceId);

        botao
            .off("click.rhQuotaPdf")
            .on("click.rhQuotaPdf", function () {
                RHPdfExport.gerar(
                    "cotas_tabelas",
                    "Cotas - Tabelas Detalhadas",
                    that.montarTabelasExportacao(),
                    botao
                );
            });
    },

    bindGerarXlsx: function () {
        var that = this;
        var botao = $("#rhQuotaGerarXlsx_" + this.instanceId);

        botao
            .off("click.rhQuotaXlsx")
            .on("click.rhQuotaXlsx", function () {
                RHXlsxExport.gerar(
                    "cotas_tabelas",
                    that.montarTabelasExportacao(),
                    botao
                );
            });
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();

        var registrosPcd = RHQuotaService.buscarPcd(filtros);
        var registrosAprendiz = RHQuotaService.buscarAprendiz(filtros);
        var registrosAprendizAtuais = RHQuotaService.buscarAprendizAtuais(filtros);
        var registrosPcdAtuais = RHQuotaService.buscarPcdAtuais(filtros);

        console.log("[RH Estratégico] Dados de Cotas PCD:", registrosPcd);
        console.log("[RH Estratégico] Dados de Cotas Aprendiz:", registrosAprendiz);
        console.log("[RH Estratégico] Dados de Aprendizes Atuais:", registrosAprendizAtuais);
        console.log("[RH Estratégico] Dados de PCD Atuais:", registrosPcdAtuais);

        var resumoPcd = RHQuotaService.resumoPcd(registrosPcd);
        var resumoAprendiz = RHQuotaService.resumoAprendiz(registrosAprendiz);

        $("#rhQuotaPcdBase_" + this.instanceId).text(resumoPcd.base);
        $("#rhQuotaPcdExigida_" + this.instanceId).text(resumoPcd.cota);
        $("#rhQuotaPcdAtual_" + this.instanceId).text(resumoPcd.atual);
        $("#rhQuotaPcdFaltante_" + this.instanceId).text(resumoPcd.faltante);
        $("#rhQuotaPcdPercentual_" + this.instanceId).text(
            resumoPcd.percentual !== null ? resumoPcd.percentual + "%" : "-"
        );

        $("#rhQuotaAprendizBase_" + this.instanceId).text(resumoAprendiz.base);
        $("#rhQuotaAprendizMinimo_" + this.instanceId).text(resumoAprendiz.minimo);
        $("#rhQuotaAprendizAtual_" + this.instanceId).text(resumoAprendiz.atual);
        $("#rhQuotaAprendizFaltante_" + this.instanceId).text(resumoAprendiz.faltante);
        $("#rhQuotaAprendizPercentual_" + this.instanceId).text(
            resumoAprendiz.percentual !== null ? resumoAprendiz.percentual + "%" : "-"
        );

        var statusPcd = RHQuotaService.agruparStatusPcd(registrosPcd);
        var statusAprendiz = RHQuotaService.agruparStatusAprendiz(registrosAprendiz);
        var statusOrdenado = ["Cumprida", "Parcialmente Cumprida", "Não Cumprida", "Não Aplicável"];

        var ranking = RHQuotaService.rankingDeficit(registrosPcd, registrosAprendiz, 8);

        RHCharts.renderQuota(this.instanceId, {
            statusPcd: {
                labels: statusOrdenado,
                valores: statusOrdenado.map(function (status) {
                    return statusPcd[status] || 0;
                })
            },
            statusAprendiz: {
                labels: statusOrdenado,
                valores: statusOrdenado.map(function (status) {
                    return statusAprendiz[status] || 0;
                })
            },
            ranking: {
                labels: ranking.map(function (item) {
                    return item.nome;
                }),
                valores: ranking.map(function (item) {
                    return item.deficit;
                })
            }
        });

        // Guarda os dados já processados para os cliques de drill-down nos KPIs
        this.dados = {
            pcd: RHQuotaService.tabelaPcd(registrosPcd),
            aprendiz: RHQuotaService.tabelaAprendiz(registrosAprendiz),
            pcdAtuais: RHQuotaService.listaPcdAtuais(registrosPcdAtuais),
            aprendizAtuais: RHQuotaService.listaAprendizAtuais(registrosAprendizAtuais)
        };

        this.renderTabelaStatus(
            "#rhQuotaTabelaPcd_" + this.instanceId,
            this.dados.pcd,
            [
                "cnpjColigada", "codColigada", "nomeColigada", "codFilial", "filial", "cnpjFilial",
                "base", "nroFaixa", "limiteSuperior", "percentualLegal", "atual", "cotaBruta", "cota",
                "faltante", "percentualTexto", "status"
            ]
        );

        this.renderTabelaStatus(
            "#rhQuotaTabelaAprendiz_" + this.instanceId,
            this.dados.aprendiz,
            [
                "codColigada", "nomeColigada", "cnpjColigada", "codFilial", "filial", "cnpjFilial",
                "base", "minimo", "maximo", "atual", "faltante", "percentualTexto", "status"
            ]
        );

        this.renderTabelaVencimentos(
            RHQuotaService.aprendizesVencendo(registrosAprendizAtuais, 10)
        );

        this.fecharDrilldown();
    },

    renderTabelaStatus: function (seletor, registros, campos) {
        var corpo = $(seletor);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: campos.length, "class": "rh-table-empty", text: "Nenhuma filial encontrada" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            campos.forEach(function (campo) {
                linha.append($("<td>").text(item[campo]));
            });

            corpo.append(linha);
        });
    },

    renderTabelaVencimentos: function (registros) {
        var corpo = $("#rhQuotaTabelaVencimentos_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 4, "class": "rh-table-empty", text: "Nenhum contrato de aprendiz vencendo em breve" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.filial));
            linha.append($("<td>").text(item.fimTexto));
            linha.append($("<td>").text(item.diasRestantes));

            corpo.append(linha);
        });
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhQuota_" + this.instanceId,
            "#rhQuotaDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        var d = this.dados;

        if (!d) {
            return null;
        }

        var configs = {
            pcdBase: {
                titulo: "Cota PCD — Colaboradores Ativos por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" }
                ],
                linhas: d.pcd
            },
            pcdCota: {
                titulo: "Cota PCD — Cota Exigida por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" },
                    { campo: "cota", rotulo: "Cota" }
                ],
                linhas: d.pcd.filter(function (item) { return item.cota > 0; })
            },
            pcdAtual: {
                titulo: "Cota PCD — Colaboradores PCD Atuais",
                colunas: [
                    { campo: "nome", rotulo: "Nome" },
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "funcao", rotulo: "Função" },
                    { campo: "tipoDeficiencia", rotulo: "Tipo de Deficiência" },
                    { campo: "admissao", rotulo: "Admissão" }
                ],
                linhas: d.pcdAtuais
            },
            pcdFaltante: {
                titulo: "Cota PCD — Filiais com Déficit",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "cota", rotulo: "Cota" },
                    { campo: "atual", rotulo: "Atual" },
                    { campo: "faltante", rotulo: "Faltante" }
                ],
                linhas: d.pcd.filter(function (item) { return item.faltante > 0; })
            },
            pcdPercentual: {
                titulo: "Cota PCD — % Cumprimento por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "cota", rotulo: "Cota" },
                    { campo: "atual", rotulo: "Atual" },
                    { campo: "percentualTexto", rotulo: "% Cumprimento" }
                ],
                linhas: d.pcd.filter(function (item) { return item.cota > 0; })
            },
            aprendizBase: {
                titulo: "Cota Aprendiz — Base de Cálculo por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" }
                ],
                linhas: d.aprendiz
            },
            aprendizMinimo: {
                titulo: "Cota Aprendiz — Mínimo Exigido por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "base", rotulo: "Base" },
                    { campo: "minimo", rotulo: "Mínimo" }
                ],
                linhas: d.aprendiz.filter(function (item) { return item.minimo > 0; })
            },
            aprendizAtual: {
                titulo: "Cota Aprendiz — Aprendizes Atuais",
                colunas: [
                    { campo: "nome", rotulo: "Nome" },
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "funcao", rotulo: "Função" },
                    { campo: "admissao", rotulo: "Admissão" },
                    { campo: "fimContrato", rotulo: "Fim Contrato" }
                ],
                linhas: d.aprendizAtuais
            },
            aprendizFaltante: {
                titulo: "Cota Aprendiz — Filiais com Déficit",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "minimo", rotulo: "Mínimo" },
                    { campo: "atual", rotulo: "Atual" },
                    { campo: "faltante", rotulo: "Faltante" }
                ],
                linhas: d.aprendiz.filter(function (item) { return item.faltante > 0; })
            },
            aprendizPercentual: {
                titulo: "Cota Aprendiz — % Cumprimento por Filial",
                colunas: [
                    { campo: "filial", rotulo: "Filial" },
                    { campo: "minimo", rotulo: "Mínimo" },
                    { campo: "atual", rotulo: "Atual" },
                    { campo: "percentualTexto", rotulo: "% Cumprimento" }
                ],
                linhas: d.aprendiz.filter(function (item) { return item.minimo > 0; })
            }
        };

        return configs[chave] || null;
    },

    fecharDrilldown: function () {
        RHDrilldown.fechar("#rhQuotaDrilldown_" + this.instanceId);
    }

};

var RHLeaveView = {

    instanceId: null,
    registros: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Afastamentos inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhLeaveExportar_" + instanceId,
            "#rhLeaveCaptura_" + instanceId,
            "afastamentos"
        );

        var tabelasExportacao = [
            {
                titulo: "Afastados com Mais de 30 Dias",
                seletor: $("#rhLeaveTabelaLongoPrazo_" + instanceId).closest("table")[0]
            }
        ];

        RHPdfExport.bind(
            "#rhLeaveGerarPdf_" + instanceId,
            "afastamentos_tabela",
            "Afastamentos - Mais de 30 Dias",
            tabelasExportacao
        );

        RHXlsxExport.bind(
            "#rhLeaveGerarXlsx_" + instanceId,
            "afastamentos_tabela",
            tabelasExportacao
        );
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();
        var registros = RHLeaveService.buscar(filtros);

        console.log("[RH Estratégico] Dados de Afastamentos:", registros);

        this.registros = registros;

        var resumo = RHLeaveService.calcularResumo(registros);

        $("#rhLeaveTotal_" + this.instanceId).text(resumo.total);
        $("#rhLeaveAtuais_" + this.instanceId).text(resumo.afastadosAgora);
        $("#rhLeaveDiasPerdidos_" + this.instanceId).text(resumo.diasPerdidos);
        $("#rhLeaveMediaDias_" + this.instanceId).text(resumo.mediaDias);
        $("#rhLeaveAcidentes_" + this.instanceId).text(resumo.acidentesTrabalho);

        var porTipo = RHLeaveService.agruparPorTipo(registros);
        var tiposOrdenados = Object.keys(porTipo).sort(function (a, b) {
            return porTipo[b] - porTipo[a];
        });

        var porDuracao = RHLeaveService.agruparPorDuracao(registros);
        var duracaoOrdenada = ["Até 3 dias", "4 a 15 dias", "Acima de 15 dias"];

        var ranking = RHLeaveService.rankingPorSecao(registros, 8);

        RHCharts.renderLeave(this.instanceId, {
            tipo: {
                labels: tiposOrdenados,
                valores: tiposOrdenados.map(function (tipo) {
                    return porTipo[tipo];
                })
            },
            duracao: {
                labels: duracaoOrdenada,
                valores: duracaoOrdenada.map(function (faixa) {
                    return porDuracao[faixa] || 0;
                })
            },
            ranking: {
                labels: ranking.map(function (item) {
                    return item.secao;
                }),
                valores: ranking.map(function (item) {
                    return item.dias;
                })
            }
        });

        this.renderTabelaLongoPrazo(
            RHLeaveService.afastadosLongoPrazo(registros, 15)
        );

        RHDrilldown.fechar("#rhLeaveDrilldown_" + this.instanceId);
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhLeave_" + this.instanceId,
            "#rhLeaveDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registros) {
            return null;
        }

        var that = RHLeaveService;

        var filtros = {
            total: function () { return true; },
            afastadosAgora: function (item) { return that.status(item) === "Em Aberto"; },
            diasPerdidos: function () { return true; },
            mediaDias: function () { return true; },
            acidentes: function (item) { return that.ehAcidenteTrabalho(item); }
        };

        var titulos = {
            total: "Todos os Afastamentos",
            afastadosAgora: "Afastados Atualmente",
            diasPerdidos: "Afastamentos (Dias Perdidos)",
            mediaDias: "Afastamentos (Dias Perdidos)",
            acidentes: "Afastamentos por Acidente de Trabalho"
        };

        if (!filtros[chave]) {
            return null;
        }

        var linhas = this.registros
            .filter(filtros[chave])
            .map(function (item) {
                return {
                    chapa: item.CHAPA,
                    nome: item.NOME,
                    secao: item["SEÇÃO"] || "-",
                    tipo: that.tipoAgrupado(item),
                    inicio: item["INICIO DO AFASTAMENTO"] || "-",
                    fim: item["FIM DO AFASTAMENTO"] || "-",
                    dias: that.parseNumero(item["DIAS DE AFASTAMENTO"])
                };
            })
            .sort(function (a, b) {
                return b.dias - a.dias;
            });

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "chapa", rotulo: "Chapa" },
                { campo: "nome", rotulo: "Colaborador" },
                { campo: "secao", rotulo: "Seção" },
                { campo: "tipo", rotulo: "Tipo" },
                { campo: "inicio", rotulo: "Início" },
                { campo: "fim", rotulo: "Fim" },
                { campo: "dias", rotulo: "Dias" }
            ],
            linhas: linhas
        };
    },

    renderTabelaLongoPrazo: function (registros) {
        var corpo = $("#rhLeaveTabelaLongoPrazo_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 6, "class": "rh-table-empty", text: "Nenhum afastamento acima de 30 dias em aberto" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.chapa));
            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.secao));
            linha.append($("<td>").text(item.tipo));
            linha.append($("<td>").text(item.inicio));
            linha.append($("<td>").text(item.dias));

            corpo.append(linha);
        });
    }

};

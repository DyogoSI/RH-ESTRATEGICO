var RHOverviewView = {

    instanceId: null,
    dadosMensais: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão Geral inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhOverviewExportar_" + instanceId,
            "#rhOverviewCaptura_" + instanceId,
            "visao_geral"
        );
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();
        var registros = RHOverviewService.buscar(filtros);

        console.log("[RH Estratégico] Dados da Visão Geral:", registros);

        var meses = {};

        registros.forEach(function (item) {
            var chave = item.DATA;

            if (!meses[chave]) {
                meses[chave] = {
                    data: item.DATA,
                    mes: item.MES,
                    headcount: 0,
                    admissoes: 0,
                    rescisoes: 0,
                    afastamentos: 0,
                    ferias: 0
                };
            }

            meses[chave].headcount += Number(item.HEADCOUNT || 0);
            meses[chave].admissoes += Number(item.ADMISSOES || 0);
            meses[chave].rescisoes += Number(item.RESCISOES || 0);
            meses[chave].afastamentos += Number(item.AFASTAMENTOS || 0);
            meses[chave].ferias += Number(item.FERIAS || 0);
        });

        var dadosMensais = Object.keys(meses)
            .sort()
            .map(function (chave) {
                return meses[chave];
            });

        this.dadosMensais = dadosMensais;

        var totalAdmissoes = 0;
        var totalRescisoes = 0;
        var totalAfastamentos = 0;
        var totalFerias = 0;

        dadosMensais.forEach(function (item) {
            totalAdmissoes += item.admissoes;
            totalRescisoes += item.rescisoes;
            totalAfastamentos += item.afastamentos;
            totalFerias += item.ferias;
        });

        var ultimoMes = dadosMensais.length > 0
            ? dadosMensais[dadosMensais.length - 1]
            : null;

        var headcount = ultimoMes ? ultimoMes.headcount : 0;
        var afastamentosAtuais = ultimoMes ? ultimoMes.afastamentos : 0;
        var feriasAtuais = ultimoMes ? ultimoMes.ferias : 0;

        var dados = {
            kpis: {
                headcount: headcount,
                admissoes: totalAdmissoes,
                rescisoes: totalRescisoes,
                afastamentos: totalAfastamentos,
                ferias: totalFerias
            },

            movimentacao: {
                labels: dadosMensais.map(function (item) {
                    return item.mes;
                }),

                admissoes: dadosMensais.map(function (item) {
                    return item.admissoes;
                }),

                rescisoes: dadosMensais.map(function (item) {
                    return item.rescisoes;
                })
            },

            distribuicao: {
                labels: ["Ativos", "Afastados", "Férias"],
                valores: [
                    Math.max(headcount - afastamentosAtuais - feriasAtuais, 0),
                    afastamentosAtuais,
                    feriasAtuais
                ]
            }
        };

        RHKpiCards.render(this.instanceId, dados.kpis);
        RHCharts.renderOverview(this.instanceId, dados);

        RHDrilldown.fechar("#rhOverviewDrilldown_" + this.instanceId);
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhOverview_" + this.instanceId,
            "#rhOverviewDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        var meses = this.dadosMensais;

        if (!meses) {
            return null;
        }

        var titulos = {
            headcount: "Headcount por Mês",
            admissoes: "Admissões por Mês",
            rescisoes: "Rescisões por Mês",
            afastamentos: "Afastamentos por Mês",
            ferias: "Férias por Mês"
        };

        if (!titulos[chave]) {
            return null;
        }

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "mes", rotulo: "Mês" },
                { campo: "valor", rotulo: "Valor" }
            ],
            linhas: meses.map(function (item) {
                return { mes: item.mes, valor: item[chave] };
            })
        };
    }

};

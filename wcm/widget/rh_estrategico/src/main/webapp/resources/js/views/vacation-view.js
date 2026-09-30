var RHVacationView = {

    instanceId: null,
    registrosSaldoTodos: null,
    registrosMarcadasTodos: null,
    registrosSaldo: null,
    registrosMarcadas: null,
    secaoAtual: "",
    chartSaldoSecao: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Férias inicializada:", instanceId);

        this.bindKpiClicks();
        this.bindFiltroSecao();
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

    bindFiltroSecao: function () {
        var that = this;

        $("#rhVacationSecao_" + this.instanceId).on("change", function () {
            that.secaoAtual = $(this).val();
            that.aplicarFiltroSecao();
        });
    },

    // Busca os dados (respeitando os filtros globais de período/empresa/
    // filial) e monta a lista de seções a partir do que voltou — não existe
    // dataset separado de "seções", então a lista é derivada dos próprios
    // registros de férias
    atualizar: function () {
        var filtros = RHState.getFiltros();

        this.registrosSaldoTodos = RHVacationService.buscarSaldo(filtros);
        this.registrosMarcadasTodos = RHVacationService.buscarMarcadas(filtros);

        console.log("[RH Estratégico] Dados de Férias (saldo):", this.registrosSaldoTodos);
        console.log("[RH Estratégico] Dados de Férias (marcadas):", this.registrosMarcadasTodos);

        this.carregarOpcoesSecao();
        this.aplicarFiltroSecao();
    },

    carregarOpcoesSecao: function () {
        var secoes = {};

        (this.registrosSaldoTodos || []).forEach(function (item) {
            var codigo = item.CODSECAO;

            if (codigo && !secoes[codigo]) {
                secoes[codigo] = item["SEÇÃO"] || codigo;
            }
        });

        (this.registrosMarcadasTodos || []).forEach(function (item) {
            var codigo = item.CODSECAO;

            if (codigo && !secoes[codigo]) {
                secoes[codigo] = item.DESCRICAO || codigo;
            }
        });

        var select = $("#rhVacationSecao_" + this.instanceId);
        var valorAtual = this.secaoAtual;

        select.empty();
        select.append('<option value="">Todas as seções</option>');

        Object.keys(secoes)
            .sort(function (a, b) {
                return String(secoes[a]).localeCompare(String(secoes[b]));
            })
            .forEach(function (codigo) {
                select.append(
                    $("<option>", {
                        value: codigo,
                        text: secoes[codigo]
                    })
                );
            });

        // Mantém a seção escolhida se ela continuar existindo na lista nova
        // (ex.: depois de trocar o filtro de empresa); senão volta pra "Todas"
        if (valorAtual && secoes[valorAtual]) {
            select.val(valorAtual);
        } else {
            this.secaoAtual = "";
            select.val("");
        }
    },

    // Filtra os registros já carregados pela seção escolhida — não busca de
    // novo no servidor, já que a seção é só um recorte do que já veio
    aplicarFiltroSecao: function () {
        var secao = this.secaoAtual;

        var filtrarPorSecao = function (item) {
            return String(item.CODSECAO) === String(secao);
        };

        this.registrosSaldo = secao
            ? (this.registrosSaldoTodos || []).filter(filtrarPorSecao)
            : (this.registrosSaldoTodos || []);

        this.registrosMarcadas = secao
            ? (this.registrosMarcadasTodos || []).filter(filtrarPorSecao)
            : (this.registrosMarcadasTodos || []);

        this.renderizar();
    },

    renderizar: function () {
        var registrosSaldo = this.registrosSaldo;
        var registrosMarcadas = this.registrosMarcadas;

        var resumo = RHVacationService.calcularResumo(registrosSaldo, registrosMarcadas);

        $("#rhVacationTotal_" + this.instanceId)
            .text(resumo.saldoTotal);

        $("#rhVacationTotalColaboradores_" + this.instanceId)
            .text(resumo.totalColaboradores);

        $("#rhVacationSaldoMedio_" + this.instanceId)
            .text(resumo.saldoMedio);

        $("#rhVacationVencendo_" + this.instanceId)
            .text(resumo.vencendoEm30);

        $("#rhVacationAgora_" + this.instanceId)
            .text(resumo.deFeriasAgora);


        // Hover - Saldo
        $("#rhVacationHoverColaboradores_" + this.instanceId)
            .text(resumo.totalColaboradores);

        $("#rhVacationHoverPeriodos_" + this.instanceId)
            .text(resumo.totalPeriodos);

        $("#rhVacationHoverGozados_" + this.instanceId)
            .text(resumo.diasGozados);


        // Hover - Média
        $("#rhVacationHoverSaldoTotal_" + this.instanceId)
            .text(resumo.saldoTotal + " dias");

        $("#rhVacationHoverMediaColaboradores_" + this.instanceId)
            .text(resumo.totalColaboradores);


        // Hover - Vencimentos
        $("#rhVacationVencendo7_" + this.instanceId)
            .text(resumo.vencendoAte7);

        $("#rhVacationVencendo15_" + this.instanceId)
            .text(resumo.vencendo8a15);

        $("#rhVacationVencendo30_" + this.instanceId)
            .text(resumo.vencendo16a30);

        // Hover - Programações
        $("#rhVacationProgramadas30_" + this.instanceId)
            .text(resumo.programadasEm30);

        $("#rhVacationDiasProgramados30_" + this.instanceId)
            .text(resumo.diasProgramadosEm30);

        // Novo gráfico ECharts - Saldo x Dias Gozados por Seção
        this.renderizarSaldoSecaoEChart(registrosSaldo);

        // O gráfico de situação continua usando Chart.js
        var porSituacao = RHVacationService.agruparMarcadasPorSituacao(
            registrosMarcadas
        );

        var situacoes = Object.keys(porSituacao);
        var that = this;

        RHCharts.renderVacationSituacao(
            this.instanceId,
            {
                labels: situacoes,

                valores: situacoes.map(function (situacao) {
                    return porSituacao[situacao];
                }),

                onClick: function (situacao) {
                    that.abrirDetalheSituacao(situacao);
                }
            }
        );

        this.renderTabelaVencimentos(
            RHVacationService.proximosVencimentos(registrosSaldo, 10)
        );

        this.renderTabelaAgora(
            RHVacationService.colaboradoresDeFerias(registrosMarcadas)
        );

        RHDrilldown.fechar("#rhVacationDrilldown_" + this.instanceId);
    },

    renderizarSaldoSecaoEChart: function (registrosSaldo) {
        var that = this;

        if (typeof echarts === "undefined") {
            console.error(
                "[RH Estratégico] ECharts não foi carregado."
            );

            return;
        }

        var elemento = document.getElementById(
            "rhVacationChartSecao_" + this.instanceId
        );

        if (!elemento) {
            return;
        }

        var dados = RHVacationService
            .saldoEGozadoPorSecao(registrosSaldo)
            .slice(0, 8);


        if (!this.chartSaldoSecao) {
            this.chartSaldoSecao = echarts.init(elemento);
        }


        var secoes = dados.map(function (item) {
            return item.secao;
        });

        var saldos = dados.map(function (item) {
            return item.saldo;
        });

        var diasGozados = dados.map(function (item) {
            return item.diasGozados;
        });


        this.chartSaldoSecao.setOption(
            {
                animation: true,

                animationDuration: 700,

                animationEasing: "cubicOut",


                grid: {
                    top: 8,
                    right: 20,
                    bottom: 20,
                    left: 115
                },


                tooltip: {
                    trigger: "axis",

                    axisPointer: {
                        type: "shadow",

                        shadowStyle: {
                            color: "rgba(15, 23, 42, 0.035)"
                        }
                    },

                    backgroundColor: "#ffffff",

                    borderColor: "#e2e8f0",

                    borderWidth: 1,

                    padding: 14,

                    textStyle: {
                        color: "#334155",
                        fontSize: 12
                    },

                    extraCssText:
                        "pointer-events:none;" +
                        "border-radius:14px;" +
                        "box-shadow:0 12px 36px rgba(15,23,42,.12);",

                    formatter: function (params) {
                        if (!params || !params.length) {
                            return "";
                        }

                        var indice = params[0].dataIndex;
                        var item = dados[indice];

                        if (!item) {
                            return "";
                        }

                        var secao = $("<div>")
                            .text(item.secao)
                            .html();

                        return [
                            '<div style="min-width:210px">',

                            '<div style="' +
                            'font-size:13px;' +
                            'font-weight:700;' +
                            'color:#0f172a;' +
                            'margin-bottom:10px;">',
                            secao,
                            '</div>',

                            '<div style="' +
                            'display:flex;' +
                            'justify-content:space-between;' +
                            'gap:24px;' +
                            'margin-bottom:7px;">',

                            '<span style="color:#64748b;">',
                            '<span style="' +
                            'display:inline-block;' +
                            'width:7px;' +
                            'height:7px;' +
                            'margin-right:7px;' +
                            'border-radius:50%;' +
                            'background:#6366f1;">',
                            '</span>',
                            'Saldo total',
                            '</span>',

                            '<strong style="color:#0f172a;">',
                            item.saldo,
                            ' dias',
                            '</strong>',

                            '</div>',

                            '<div style="' +
                            'display:flex;' +
                            'justify-content:space-between;' +
                            'gap:24px;' +
                            'margin-bottom:7px;">',

                            '<span style="color:#64748b;">',
                            '<span style="' +
                            'display:inline-block;' +
                            'width:7px;' +
                            'height:7px;' +
                            'margin-right:7px;' +
                            'border-radius:50%;' +
                            'background:#cbd5e1;">',
                            '</span>',
                            'Dias gozados',
                            '</span>',

                            '<strong style="color:#0f172a;">',
                            item.diasGozados,
                            ' dias',
                            '</strong>',

                            '</div>',

                            '<div style="' +
                            'display:flex;' +
                            'justify-content:space-between;' +
                            'gap:24px;' +
                            'margin-bottom:7px;">',

                            '<span style="color:#64748b;">',
                            'Saldo médio',
                            '</span>',

                            '<strong style="color:#0f172a;">',
                            item.saldoMedio,
                            ' dias',
                            '</strong>',

                            '</div>',

                            '<div style="' +
                            'display:flex;' +
                            'justify-content:space-between;' +
                            'gap:24px;">',

                            '<span style="color:#64748b;">',
                            'Colaboradores',
                            '</span>',

                            '<strong style="color:#0f172a;">',
                            item.colaboradores,
                            '</strong>',

                            '</div>',

                            '<div style="' +
                            'margin-top:10px;' +
                            'padding-top:9px;' +
                            'border-top:1px solid #f1f5f9;' +
                            'color:#6366f1;' +
                            'font-size:10px;' +
                            'font-weight:700;">',

                            'Clique para explorar a seção',

                            '</div>',

                            '</div>'
                        ].join("");
                    }
                },


                xAxis: {
                    type: "value",

                    axisLine: {
                        show: false
                    },

                    axisTick: {
                        show: false
                    },

                    splitLine: {
                        lineStyle: {
                            color: "#f1f5f9"
                        }
                    },

                    axisLabel: {
                        color: "#94a3b8",
                        fontSize: 10
                    }
                },


                yAxis: {
                    type: "category",

                    data: secoes,

                    inverse: true,

                    axisLine: {
                        show: false
                    },

                    axisTick: {
                        show: false
                    },

                    axisLabel: {
                        color: "#475569",

                        fontSize: 11,

                        width: 100,

                        overflow: "truncate"
                    }
                },


                series: [
                    {
                        name: "Saldo",

                        type: "bar",

                        data: saldos,

                        barWidth: 9,

                        barGap: "45%",

                        itemStyle: {
                            color: "#6366f1",

                            borderRadius: [0, 6, 6, 0]
                        },

                        emphasis: {
                            itemStyle: {
                                color: "#4f46e5"
                            }
                        }
                    },

                    {
                        name: "Dias gozados",

                        type: "bar",

                        data: diasGozados,

                        barWidth: 9,

                        itemStyle: {
                            color: "#cbd5e1",

                            borderRadius: [0, 6, 6, 0]
                        },

                        emphasis: {
                            itemStyle: {
                                color: "#94a3b8"
                            }
                        }
                    }
                ]
            },
            true
        );

        // Clique em qualquer ponto da linha da seção (não só na barra)
        var zr = this.chartSaldoSecao.getZr();
        var chartSecao = this.chartSaldoSecao;

        zr.off("click");

        zr.on("click", function (event) {
            var ponto = [event.offsetX, event.offsetY];

            if (!chartSecao.containPixel({ gridIndex: 0 }, ponto)) {
                return;
            }

            var indice = chartSecao.convertFromPixel(
                { yAxisIndex: 0 },
                event.offsetY
            );

            var item = dados[Math.round(indice)];

            if (!item) {
                return;
            }

            that.abrirDetalheSecao(item.secao);
        });


        $(
            "#rhVacation_" + this.instanceId +
            " [data-rh-vacation-expand='saldo-secao']"
        )
            .off("click.rhVacationExpand")
            .on(
                "click.rhVacationExpand",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    that.abrirSaldoSecaoExpandido();
                }
            );
    },

    abrirDetalheSituacao: function (situacao) {
        var registros = (this.registrosMarcadas || []).filter(function (item) {
            return RHVacationService.rotuloSituacao(item.SITUACAOFERIAS) === situacao;
        });

        var secoes = {};
        var pessoas = {};

        var linhas = registros
            .map(function (item) {
                var inicio = RHVacationService.parseData(item.DATAINICIO);
                var fim = RHVacationService.parseData(item.DATAFIM);
                var secao = item.DESCRICAO || item["SEÇÃO"] || "-";

                secoes[secao] = true;
                pessoas[String(item.COLIGADA || "") + "|" + String(item.CHAPA || item.NOME || "")] = true;

                return {
                    nome: item.NOME || "-",
                    chapa: item.CHAPA || "-",
                    secao: secao,
                    inicio: item.DATAINICIO || "-",
                    fim: item.DATAFIM || "-",
                    dias: inicio && fim
                        ? Math.round((fim - inicio) / 86400000) + 1 + " dias"
                        : "-",
                    inicioData: inicio
                };
            })
            .sort(function (a, b) {
                return (a.inicioData || 0) - (b.inicioData || 0);
            });

        RHDetailPanel.open({
            instanceId: this.instanceId,

            eyebrow: "Férias · Situação",

            titulo: situacao,

            subtitulo:
                "Colaboradores com férias nesta situação.",

            metricas: [
                {
                    label: "Registros",
                    valor: linhas.length,
                    descricao: "Férias nesta situação"
                },
                {
                    label: "Colaboradores",
                    valor: Object.keys(pessoas).length,
                    descricao: "Pessoas distintas"
                },
                {
                    label: "Seções",
                    valor: Object.keys(secoes).length,
                    descricao: "Seções envolvidas"
                }
            ],

            colunas: [
                { campo: "nome", rotulo: "Colaborador" },
                { campo: "chapa", rotulo: "Chapa" },
                { campo: "secao", rotulo: "Seção" },
                { campo: "inicio", rotulo: "Início" },
                { campo: "fim", rotulo: "Fim" },
                { campo: "dias", rotulo: "Duração" }
            ],

            linhas: linhas
        });
    },

    abrirDetalheSecao: function (secao) {
        var registros = (this.registrosSaldo || []).filter(function (item) {
            return String(
                item["SEÇÃO"] || "Não informado"
            ).trim() === String(secao || "").trim();
        });


        var resumoSecao = RHVacationService.saldoEGozadoPorSecao(
            registros
        );

        var agregado = resumoSecao.length
            ? resumoSecao[0]
            : {
                saldo: 0,
                diasGozados: 0,
                colaboradores: 0,
                saldoMedio: 0
            };


        /*
         * O dataset pode ter mais de um período aquisitivo
         * para o mesmo colaborador.
         *
         * Para o painel não repetir pessoas, consolidamos
         * os registros por COLIGADA + CHAPA.
         */
        var colaboradores = {};

        registros.forEach(function (item) {
            var chave =
                String(item.COLIGADA || "") +
                "|" +
                String(item.CHAPA || item.NOME || "");

            if (!colaboradores[chave]) {
                colaboradores[chave] = {
                    nome: item.NOME || "-",
                    chapa: item.CHAPA || "-",

                    saldo: 0,
                    gozados: 0,

                    vencimento: "-",
                    vencimentoData: null
                };
            }


            colaboradores[chave].saldo +=
                RHVacationService.parseNumero(
                    item.SALDO
                );


            colaboradores[chave].gozados +=
                RHVacationService.parseNumero(
                    item["DIAS GOZADOS"]
                );


            var vencimentoTexto =
                RHVacationService.obterVencimento30(item);

            var vencimentoData =
                RHVacationService.parseData(vencimentoTexto);


            /*
             * Caso existam vários períodos para a mesma pessoa,
             * mantém o vencimento mais próximo.
             */
            if (
                vencimentoData
                && (
                    !colaboradores[chave].vencimentoData
                    || vencimentoData <
                    colaboradores[chave].vencimentoData
                )
            ) {
                colaboradores[chave].vencimento =
                    vencimentoTexto;

                colaboradores[chave].vencimentoData =
                    vencimentoData;
            }
        });


        var linhas = Object.keys(colaboradores)
            .map(function (chave) {
                var item = colaboradores[chave];

                return {
                    nome: item.nome,

                    chapa: item.chapa,

                    saldo:
                        Math.round(item.saldo * 100) / 100
                        + " dias",

                    gozados:
                        Math.round(item.gozados * 100) / 100
                        + " dias",

                    vencimento: item.vencimento
                };
            })
            .sort(function (a, b) {
                return String(a.nome).localeCompare(
                    String(b.nome)
                );
            });


        RHDetailPanel.open({
            instanceId: this.instanceId,

            eyebrow: "Férias · Seção",

            titulo: secao,

            subtitulo:
                "Composição do saldo e utilização de férias da seção selecionada.",

            metricas: [
                {
                    label: "Saldo total",
                    valor: agregado.saldo + " dias",
                    descricao: "Saldo disponível"
                },
                {
                    label: "Dias gozados",
                    valor: agregado.diasGozados + " dias",
                    descricao: "Utilização registrada"
                },
                {
                    label: "Saldo médio",
                    valor: agregado.saldoMedio + " dias",
                    descricao: "Por colaborador"
                },
                {
                    label: "Colaboradores",
                    valor: agregado.colaboradores,
                    descricao: "Pessoas na composição"
                }
            ],

            colunas: [
                {
                    campo: "nome",
                    rotulo: "Colaborador"
                },
                {
                    campo: "chapa",
                    rotulo: "Chapa"
                },
                {
                    campo: "saldo",
                    rotulo: "Saldo"
                },
                {
                    campo: "gozados",
                    rotulo: "Dias gozados"
                },
                {
                    campo: "vencimento",
                    rotulo: "Próximo vencimento"
                }
            ],

            linhas: linhas
        });
    },

    abrirSaldoSecaoExpandido: function () {
        var that = this;

        if (typeof echarts === "undefined") {
            return;
        }

        var dados = RHVacationService.saldoEGozadoPorSecao(
            this.registrosSaldo || []
        );

        var totalSecoes = dados.length;

        var secoesVisiveis;

        if (totalSecoes <= 10) {
            secoesVisiveis = totalSecoes;
        } else if (totalSecoes <= 20) {
            secoesVisiveis = 12;
        } else {
            secoesVisiveis = 14;
        }

        var percentualVisivel = totalSecoes > 0
            ? Math.min(
                100,
                (secoesVisiveis / totalSecoes) * 100
            )
            : 100;


        var chartId =
            "rhVacationChartSecaoExpandido_" +
            this.instanceId;

        var conteudo = $("<div>", {
            "class": "rh-detail-chart",
            id: chartId
        });


        RHDetailPanel.open({
            instanceId: this.instanceId,

            panelClass: "rh-detail-panel--wide",

            eyebrow: "Férias · Distribuição",

            titulo: "Saldo × Dias Gozados por Seção",

            subtitulo:
                "Visualização completa das seções. Passe o mouse para consultar os indicadores e clique em uma barra para abrir os colaboradores da área.",

            conteudo: conteudo,

            afterOpen: function (contexto) {
                var elemento = document.getElementById(
                    chartId
                );

                if (!elemento) {
                    return;
                }

                var chart = echarts.init(elemento);

                var secoes = dados.map(function (item) {
                    return item.secao;
                });

                var saldos = dados.map(function (item) {
                    return item.saldo;
                });

                var gozados = dados.map(function (item) {
                    return item.diasGozados;
                });


                chart.setOption({
                    animation: true,

                    animationDuration: 700,

                    animationEasing: "cubicOut",

                    grid: {
                        top: 15,
                        right: 35,
                        bottom: 45,
                        left: 300
                    },

                    tooltip: {
                        trigger: "axis",

                        axisPointer: {
                            type: "shadow",

                            shadowStyle: {
                                color: "rgba(15, 23, 42, 0.035)"
                            }
                        },

                        backgroundColor: "#ffffff",

                        borderColor: "#e2e8f0",

                        borderWidth: 1,

                        padding: 14,

                        textStyle: {
                            color: "#334155",
                            fontSize: 12
                        },

                        extraCssText:
                            "pointer-events:none;" +
                            "border-radius:14px;" +
                            "box-shadow:0 12px 36px rgba(15,23,42,.12);",

                        formatter: function (params) {
                            if (!params || !params.length) {
                                return "";
                            }

                            var indice = params[0].dataIndex;
                            var item = dados[indice];

                            if (!item) {
                                return "";
                            }

                            var secao = $("<div>")
                                .text(item.secao)
                                .html();

                            return [
                                '<div style="min-width:230px">',

                                '<div style="' +
                                'font-size:13px;' +
                                'font-weight:700;' +
                                'color:#0f172a;' +
                                'margin-bottom:10px;">',
                                secao,
                                '</div>',

                                '<div style="' +
                                'display:flex;' +
                                'justify-content:space-between;' +
                                'gap:24px;' +
                                'margin-bottom:7px;">',

                                '<span style="color:#64748b;">',
                                'Saldo total',
                                '</span>',

                                '<strong style="color:#0f172a;">',
                                item.saldo,
                                ' dias',
                                '</strong>',

                                '</div>',

                                '<div style="' +
                                'display:flex;' +
                                'justify-content:space-between;' +
                                'gap:24px;' +
                                'margin-bottom:7px;">',

                                '<span style="color:#64748b;">',
                                'Dias gozados',
                                '</span>',

                                '<strong style="color:#0f172a;">',
                                item.diasGozados,
                                ' dias',
                                '</strong>',

                                '</div>',

                                '<div style="' +
                                'display:flex;' +
                                'justify-content:space-between;' +
                                'gap:24px;' +
                                'margin-bottom:7px;">',

                                '<span style="color:#64748b;">',
                                'Saldo médio',
                                '</span>',

                                '<strong style="color:#0f172a;">',
                                item.saldoMedio,
                                ' dias',
                                '</strong>',

                                '</div>',

                                '<div style="' +
                                'display:flex;' +
                                'justify-content:space-between;' +
                                'gap:24px;">',

                                '<span style="color:#64748b;">',
                                'Colaboradores',
                                '</span>',

                                '<strong style="color:#0f172a;">',
                                item.colaboradores,
                                '</strong>',

                                '</div>',

                                '<div style="' +
                                'margin-top:10px;' +
                                'padding-top:9px;' +
                                'border-top:1px solid #f1f5f9;' +
                                'color:#6366f1;' +
                                'font-size:10px;' +
                                'font-weight:700;">',

                                'Clique para explorar a seção',

                                '</div>',

                                '</div>'
                            ].join("");
                        }
                    },


                    xAxis: {
                        type: "value",

                        axisLine: {
                            show: false
                        },

                        axisTick: {
                            show: false
                        },

                        splitLine: {
                            lineStyle: {
                                color: "#f1f5f9"
                            }
                        },

                        axisLabel: {
                            color: "#94a3b8",
                            fontSize: 10
                        }
                    },


                    yAxis: {
                        type: "category",

                        data: secoes,

                        inverse: true,

                        axisLine: {
                            show: false
                        },

                        axisTick: {
                            show: false
                        },

                        axisLabel: {
                            color: "#475569",

                            fontSize: 11,

                            width: 260,

                            overflow: "break",

                            lineHeight: 15
                        }
                    },

                    dataZoom: [
                        {
                            type: "inside",
                            yAxisIndex: 0,

                            start: 0,
                            end: percentualVisivel
                        },
                        {
                            type: "slider",
                            yAxisIndex: 0,

                            width: 10,
                            right: 5,

                            start: 0,
                            end: percentualVisivel,

                            show: totalSecoes > secoesVisiveis,

                            borderColor: "transparent",

                            backgroundColor: "#f8fafc",

                            fillerColor:
                                "rgba(99, 102, 241, 0.08)",

                            handleStyle: {
                                color: "#6366f1",
                                borderColor: "#6366f1"
                            }
                        }
                    ],

                    series: [
                        {
                            name: "Saldo",

                            type: "bar",

                            data: saldos,

                            barWidth: 10,

                            barGap: "45%",

                            itemStyle: {
                                color: "#6366f1",

                                borderRadius: [0, 6, 6, 0]
                            },

                            emphasis: {
                                itemStyle: {
                                    color: "#4f46e5"
                                }
                            }
                        },

                        {
                            name: "Dias gozados",

                            type: "bar",

                            data: gozados,

                            barWidth: 10,

                            itemStyle: {
                                color: "#cbd5e1",

                                borderRadius: [0, 6, 6, 0]
                            },

                            emphasis: {
                                itemStyle: {
                                    color: "#94a3b8"
                                }
                            }
                        }
                    ]
                });


                chart.getZr().off("click");

                chart.getZr().on("click", function (event) {
                    if (!chart.containPixel(
                        { gridIndex: 0 },
                        [event.offsetX, event.offsetY]
                    )) {
                        return;
                    }

                    var indice = chart.convertFromPixel(
                        { yAxisIndex: 0 },
                        event.offsetY
                    );

                    var item = dados[Math.round(indice)];

                    if (!item) {
                        return;
                    }

                    /*
                     * RHDetailPanel.open fecha automaticamente
                     * o gráfico expandido antes de abrir
                     * o detalhe da seção.
                     */
                    that.abrirDetalheSecao(
                        item.secao
                    );
                });


                contexto.overlay.one(
                    "rhDetailPanel:close",
                    function () {
                        if (
                            chart
                            && !chart.isDisposed()
                        ) {
                            chart.dispose();
                        }
                    }
                );


                window.setTimeout(function () {
                    if (
                        chart
                        && !chart.isDisposed()
                    ) {
                        chart.resize();
                    }
                }, 320);
            }
        });
    },

    bindKpiClicks: function () {
        var that = this;

        $("#rhVacation_" + this.instanceId)
            .find(".rh-kpi-card[data-rh-kpi], .rh-table-card[data-rh-kpi]")
            .off("click.rhVacationDetail")
            .on("click.rhVacationDetail", function () {

                var chave = $(this).data("rh-kpi");
                var config = that.configDrilldown(chave);

                if (!config) {
                    return;
                }

                RHDetailPanel.open({
                    instanceId: that.instanceId,

                    eyebrow: "Férias",

                    titulo: config.titulo,

                    subtitulo:
                        config.subtitulo ||
                        "Explore os registros que compõem este indicador.",

                    metricas: config.metricas || [],

                    colunas: config.colunas,

                    linhas: config.linhas
                });
            });
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
                    var vencimentoTexto = RHVacationService.obterVencimento30(item);
                    var vencimentoData = RHVacationService.parseData(vencimentoTexto);

                    return {
                        nome: item.NOME,
                        secao: item["SEÇÃO"] || "-",
                        saldo: RHVacationService.parseNumero(item.SALDO),
                        vencimentoTexto: vencimentoTexto || "-",
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

            var resumo = RHVacationService.calcularResumo(
                this.registrosSaldo,
                this.registrosMarcadas
            );

            return {
                titulo: "Férias Vencendo em 30 Dias",

                subtitulo:
                    "Colaboradores que exigem atenção no curto prazo, organizados pela proximidade do vencimento.",

                metricas: [
                    {
                        label: "Total em atenção",
                        valor: resumo.vencendoEm30,
                        descricao: "Próximos 30 dias"
                    },
                    {
                        label: "Até 7 dias",
                        valor: resumo.vencendoAte7,
                        descricao: "Prioridade alta",
                        destaque: "danger"
                    },
                    {
                        label: "8 a 15 dias",
                        valor: resumo.vencendo8a15,
                        descricao: "Atenção",
                        destaque: "warning"
                    },
                    {
                        label: "16 a 30 dias",
                        valor: resumo.vencendo16a30,
                        descricao: "Monitoramento"
                    }
                ],

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

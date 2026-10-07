var RHTerminationView = {

    instanceId: null,
    registrosTodos: null,
    registros: null,

    // Campos de filtro locais (só aparecem na aba Rescisões, ver
    // "rh-filter-group--termination" em filters.css). Todos colunas "de
    // verdade" do dataset, então dá pra filtrar por qualquer combinação
    // delas ao mesmo tempo, sem nova busca no servidor — as opções de cada
    // select são derivadas dos próprios registros já carregados (respeitando
    // período/empresa/filial globais)
    CAMPOS_FILTRO: [
        { id: "rhTerminationSecao_", campoValor: "CODSECAO", campoLabel: "NOME_SECAO", textoTodos: "Todas as seções" },
        { id: "rhTerminationFuncao_", campoValor: "CODFUNCAO", campoLabel: "NOME_FUNCAO", textoTodos: "Todas as funções" },
        { id: "rhTerminationCentroCusto_", campoValor: "CODCCUSTO", campoLabel: "NOME_CENTRO_CUSTO", textoTodos: "Todos os centros de custo" },
        { id: "rhTerminationMotivo_", campoValor: "DESCRICAO_MOTIVO_RESCISAO", campoLabel: null, textoTodos: "Todos os motivos" },
        { id: "rhTerminationTipo_", campoValor: "DESCRICAO_TIPO_DEMISSAO", campoLabel: null, textoTodos: "Todos os tipos" },
        { id: "rhTerminationAvisoPrevio_", campoValor: "DESCRICAO_AVISO_PREVIO", campoLabel: null, textoTodos: "Todos" },
        { id: "rhTerminationFaixaTempo_", campoValor: "FAIXA_TEMPO_EMPRESA", campoLabel: null, textoTodos: "Todas as faixas" },
        { id: "rhTerminationFaixaEtaria_", campoValor: "FAIXA_ETARIA", campoLabel: null, textoTodos: "Todas as faixas" }
    ],

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Rescisões inicializada:", instanceId);

        this.bindKpiClicks();
        this.bindFiltrosLocais();
        this.atualizar();

        RHExport.bind(
            "#rhTerminationExportar_" + instanceId,
            "#rhTerminationCaptura_" + instanceId,
            "rescisoes"
        );

        var tabelasExportacao = [
            {
                titulo: "Últimas Rescisões",
                seletor: $("#rhTerminationTabelaUltimas_" + instanceId).closest("table")[0]
            }
        ];

        RHPdfExport.bind(
            "#rhTerminationGerarPdf_" + instanceId,
            "rescisoes_tabela",
            "Rescisões - Últimos Desligamentos",
            tabelasExportacao
        );

        RHXlsxExport.bind(
            "#rhTerminationGerarXlsx_" + instanceId,
            "rescisoes_tabela",
            tabelasExportacao
        );
    },

    bindFiltrosLocais: function () {
        var that = this;

        this.CAMPOS_FILTRO.forEach(function (campo) {
            $("#" + campo.id + that.instanceId).on("change", function () {
                that.aplicarFiltrosLocais();
            });
        });
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();

        this.registrosTodos = RHTerminationService.buscar(filtros);

        console.log("[RH Estratégico] Dados de Rescisões:", this.registrosTodos);

        this.carregarOpcoesFiltros();
        this.aplicarFiltrosLocais();
    },

    carregarOpcoesFiltros: function () {
        var that = this;

        this.CAMPOS_FILTRO.forEach(function (campo) {
            that.popularSelect(campo);
        });
    },

    popularSelect: function (campo) {
        var select = $("#" + campo.id + this.instanceId);

        if (!select.length) {
            return;
        }

        var valores = {};

        (this.registrosTodos || []).forEach(function (item) {
            var codigo = item[campo.campoValor];

            if (codigo === undefined || codigo === null || codigo === "" || valores.hasOwnProperty(codigo)) {
                return;
            }

            valores[codigo] = (campo.campoLabel ? item[campo.campoLabel] : codigo) || codigo;
        });

        var valorAtual = select.val();

        select.empty();
        select.append('<option value="">' + campo.textoTodos + '</option>');

        Object.keys(valores)
            .sort(function (a, b) {
                return String(valores[a]).localeCompare(String(valores[b]));
            })
            .forEach(function (codigo) {
                select.append(
                    $("<option>", {
                        value: codigo,
                        text: valores[codigo]
                    })
                );
            });

        // Mantém a opção escolhida se ela ainda existir na lista nova
        // (ex.: depois de trocar o filtro de empresa); senão volta pra "Todos"
        select.val(valores.hasOwnProperty(valorAtual) ? valorAtual : "");
    },

    // Filtra os registros já carregados por todos os campos escolhidos ao
    // mesmo tempo — não busca de novo no servidor
    aplicarFiltrosLocais: function () {
        var that = this;

        var escolhidos = this.CAMPOS_FILTRO
            .map(function (campo) {
                return {
                    campoValor: campo.campoValor,
                    valor: $("#" + campo.id + that.instanceId).val()
                };
            })
            .filter(function (escolha) {
                return escolha.valor;
            });

        this.registros = (this.registrosTodos || []).filter(function (item) {
            return escolhidos.every(function (escolha) {
                return String(item[escolha.campoValor]) === String(escolha.valor);
            });
        });

        this.renderizar();
    },

    renderizar: function () {
        var that = this;
        var registros = this.registros;
        var resumo = RHTerminationService.calcularResumo(registros);

        $("#rhTerminationTotal_" + this.instanceId).text(resumo.total);
        $("#rhTerminationTempoMedio_" + this.instanceId).text(resumo.tempoMedioAnos + " anos");
        $("#rhTerminationTotalLiquido_" + this.instanceId).text(this.formatarMoeda(resumo.totalLiquido));
        $("#rhTerminationTotalFgts_" + this.instanceId).text(this.formatarMoeda(resumo.totalFgts));
        $("#rhTerminationIniciativaEmpresa_" + this.instanceId).text(resumo.iniciativaEmpresa);

        var porMes = RHTerminationService.agruparPorMes(registros);
        var mesesOrdenados = Object.keys(porMes).sort();

        var porMotivo = RHTerminationService.agruparPorMotivo(registros);
        var motivosOrdenados = Object.keys(porMotivo).sort(function (a, b) {
            return porMotivo[b] - porMotivo[a];
        });

        var porFaixaTempo = RHTerminationService.agruparPorFaixaTempo(registros);

        RHCharts.renderTermination(this.instanceId, {
            mes: {
                onClick: function (mes) {
                    RHDrilldown.abrirFiltrado(
                        that.instanceId, that.configDrilldown("total"),
                        function (linha) {
                            var data = RHTerminationService.parseData(linha.dataDemissao);

                            return !!data && (
                                String(data.getMonth() + 1).padStart(2, "0") + "/" + data.getFullYear()
                            ) === mes;
                        },
                        mes, "Rescisões · Mês"
                    );
                },
                labels: mesesOrdenados.map(function (chave) {
                    var partes = chave.split("-");
                    return partes.length === 2 ? (partes[1] + "/" + partes[0]) : chave;
                }),
                valores: mesesOrdenados.map(function (chave) {
                    return porMes[chave];
                })
            },
            motivo: {
                onClick: function (motivo) {
                    RHDrilldown.abrirPorCampo(
                        that.instanceId, that.configDrilldown("total"),
                        "motivo", motivo, "Rescisões · Motivo"
                    );
                },
                labels: motivosOrdenados,
                valores: motivosOrdenados.map(function (motivo) {
                    return porMotivo[motivo];
                })
            },
            faixaTempo: {
                labels: RHTerminationService.ORDEM_FAIXA_TEMPO,
                valores: RHTerminationService.ORDEM_FAIXA_TEMPO.map(function (faixa) {
                    return porFaixaTempo[faixa] || 0;
                })
            }
        });

        this.renderTabelaUltimas(
            RHTerminationService.ultimasRescisoes(registros, 20)
        );

        RHDrilldown.fechar("#rhTerminationDrilldown_" + this.instanceId);
    },

    formatarMoeda: function (valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhTermination_" + this.instanceId,
            "#rhTerminationDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registros) {
            return null;
        }

        var servico = RHTerminationService;

        var filtros = {
            total: function () { return true; },
            tempoMedio: function () { return true; },
            totalLiquido: function () { return true; },
            totalFgts: function () { return true; },
            iniciativaEmpresa: function (item) { return servico.ehIniciativaEmpresa(item); }
        };

        var titulos = {
            total: "Todas as Rescisões",
            tempoMedio: "Rescisões (Tempo de Empresa)",
            totalLiquido: "Rescisões (Valor Líquido)",
            totalFgts: "Rescisões (FGTS 40%)",
            iniciativaEmpresa: "Desligamentos por Iniciativa da Empresa"
        };

        if (!filtros[chave]) {
            return null;
        }

        var linhas = this.registros
            .filter(filtros[chave])
            .map(function (item) {
                return {
                    colaborador: item.NOME,
                    secao: item.NOME_SECAO || "-",
                    funcao: item.NOME_FUNCAO || "-",
                    motivo: item.DESCRICAO_MOTIVO_RESCISAO || "-",
                    tipo: item.DESCRICAO_TIPO_DEMISSAO || "-",
                    dataDemissao: item.DATADEMISSAO || "-",
                    liquido: servico.parseNumero(item.TOTAL_LIQUIDO)
                };
            })
            .sort(function (a, b) {
                return b.liquido - a.liquido;
            });

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "colaborador", rotulo: "Colaborador" },
                { campo: "secao", rotulo: "Seção" },
                { campo: "funcao", rotulo: "Função" },
                { campo: "motivo", rotulo: "Motivo" },
                { campo: "tipo", rotulo: "Tipo" },
                { campo: "dataDemissao", rotulo: "Data Rescisão" },
                { campo: "liquido", rotulo: "Líquido" }
            ],
            linhas: linhas
        };
    },

    renderTabelaUltimas: function (registros) {
        var corpo = $("#rhTerminationTabelaUltimas_" + this.instanceId);

        corpo.empty();

        if (registros.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 7, "class": "rh-table-empty", text: "Nenhuma rescisão no período selecionado" })
                )
            );

            return;
        }

        registros.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.chapa));
            linha.append($("<td>").text(item.nome));
            linha.append($("<td>").text(item.secao));
            linha.append($("<td>").text(item.funcao));
            linha.append($("<td>").text(item.motivo));
            linha.append($("<td>").text(item.tipo));
            linha.append($("<td>").text(item.dataDemissao));

            corpo.append(linha);
        });
    }

};

var RHLeaveView = {

    instanceId: null,
    registrosTodos: null,
    registros: null,

    // Campos de filtro locais (só aparecem na aba Afastamentos, ver
    // "rh-filter-group--leave" em filters.css). Todos colunas "de verdade"
    // do dataset, então dá pra filtrar por qualquer combinação delas ao
    // mesmo tempo, sem nova busca no servidor — as opções de cada select
    // são derivadas dos próprios registros já carregados (respeitando
    // período/empresa/filial globais)
    CAMPOS_FILTRO: [
        { id: "rhLeaveSecao_", campoValor: "SEÇÃO", campoLabel: null, textoTodos: "Todas as áreas" },
        { id: "rhLeaveTipoAfastamento_", campoValor: "TIPO DE AFASTAMENTO", campoLabel: null, textoTodos: "Todos os tipos" },
        { id: "rhLeaveMotivo_", campoValor: "MOTIVO", campoLabel: null, textoTodos: "Todos os motivos" }
    ],

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Afastamentos inicializada:", instanceId);

        this.bindKpiClicks();
        this.bindFiltrosLocais();
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

        this.registrosTodos = RHLeaveService.buscar(filtros);

        console.log("[RH Estratégico] Dados de Afastamentos:", this.registrosTodos);

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
                onClick: function (tipo) {
                    RHDrilldown.abrirPorCampo(
                        that.instanceId, that.configDrilldown("total"),
                        "tipo", tipo, "Afastamentos · Tipo"
                    );
                },
                labels: tiposOrdenados,
                valores: tiposOrdenados.map(function (tipo) {
                    return porTipo[tipo];
                })
            },
            duracao: {
                onClick: function (faixa) {
                    RHDrilldown.abrirFiltrado(
                        that.instanceId, that.configDrilldown("total"),
                        function (linha) {
                            return RHLeaveService.faixaDuracao(linha.dias) === faixa;
                        },
                        faixa, "Afastamentos · Duração"
                    );
                },
                labels: duracaoOrdenada,
                valores: duracaoOrdenada.map(function (faixa) {
                    return porDuracao[faixa] || 0;
                })
            },
            ranking: {
                onClick: function (secao) {
                    RHDrilldown.abrirPorCampo(
                        that.instanceId, that.configDrilldown("total"),
                        "secao", secao, "Afastamentos · Seção"
                    );
                },
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
                    inicioData: that.parseData(item["INICIO DO AFASTAMENTO"]),
                    fim: item["FIM DO AFASTAMENTO"] || "-",
                    dias: that.parseNumero(item["DIAS DE AFASTAMENTO"])
                };
            });

        if (chave === "afastadosAgora") {
            // Aqui o que importa é "quem está afastado AGORA", não quem
            // acumulou mais dias — ordenar por dias deixava casos antigos
            // (em aberto há anos, nunca fechados no sistema) sempre no topo,
            // dando a impressão de datas erradas. Por início mais recente
            // primeiro, igual já fizemos na tabela de "Afastados 30+ Dias"
            linhas.sort(function (a, b) {
                var dataA = a.inicioData ? a.inicioData.getTime() : 0;
                var dataB = b.inicioData ? b.inicioData.getTime() : 0;

                return dataB - dataA;
            });
        } else {
            linhas.sort(function (a, b) {
                return b.dias - a.dias;
            });
        }

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

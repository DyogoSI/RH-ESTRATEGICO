var RHAdmissionView = {

    instanceId: null,
    registrosTodos: null,
    registros: null,

    // Campos de filtro locais (só aparecem na aba Admissões, ver
    // "rh-filter-group--admission" em filters.css). São todos colunas
    // "de verdade" do dataset (não calculadas), então dá pra filtrar por
    // qualquer combinação delas ao mesmo tempo, sem nova busca no servidor
    // — as opções de cada select são derivadas dos próprios registros já
    // carregados (respeitando período/empresa/filial globais)
    CAMPOS_FILTRO: [
        { id: "rhAdmissionSecao_", campoValor: "CODSECAO", campoLabel: "NOME_SECAO", textoTodos: "Todas as seções" },
        { id: "rhAdmissionFuncao_", campoValor: "CODFUNCAO", campoLabel: "NOME_FUNCAO", textoTodos: "Todas as funções" },
        { id: "rhAdmissionSituacao_", campoValor: "CODSITUACAO", campoLabel: null, textoTodos: "Todas as situações" },
        { id: "rhAdmissionTipoAdmissao_", campoValor: "TIPOADMISSAO", campoLabel: "DESCRICAO_TIPO_ADMISSAO", textoTodos: "Todos os tipos" },
        { id: "rhAdmissionMotivo_", campoValor: "MOTIVOADMISSAO", campoLabel: "DESCRICAO_MOTIVO_ADMISSAO", textoTodos: "Todos os motivos" },
        { id: "rhAdmissionCategoriaEsocial_", campoValor: "DESCRICAO_CATEGORIA_ESOCIAL", campoLabel: null, textoTodos: "Todas as categorias" },
        { id: "rhAdmissionSexo_", campoValor: "SEXO", campoLabel: "DESCRICAO_SEXO", textoTodos: "Todos" },
        { id: "rhAdmissionNacionalidade_", campoValor: "NACIONALIDADE", campoLabel: "DESCRICAO_NACIONALIDADE", textoTodos: "Todas" },
        { id: "rhAdmissionRaca_", campoValor: "CORRACA", campoLabel: "DESCRICAO_CORRACA", textoTodos: "Todas" },
        { id: "rhAdmissionGrauInstrucao_", campoValor: "GRAUINSTRUCAO", campoLabel: "DESCRICAO_GRAU_INSTRUCAO", textoTodos: "Todos" },
        { id: "rhAdmissionDeficiencia_", campoValor: "TIPO_DEFICIENCIA", campoLabel: null, textoTodos: "Todos" }
    ],

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Admissões inicializada:", instanceId);

        this.bindKpiClicks();
        this.bindFiltrosLocais();
        this.atualizar();

        RHExport.bind(
            "#rhAdmissionExportar_" + instanceId,
            "#rhAdmissionCaptura_" + instanceId,
            "admissoes"
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

        this.registrosTodos = RHAdmissionService.buscar(filtros);

        console.log("[RH Estratégico] Dados de Admissões:", this.registrosTodos);

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
        var resumo = RHAdmissionService.calcularResumo(registros);

        $("#rhAdmissionTotal_" + this.instanceId).text(resumo.total);
        $("#rhAdmissionClt_" + this.instanceId).text(resumo.clt);
        $("#rhAdmissionEstagio_" + this.instanceId).text(resumo.estagio);
        $("#rhAdmissionAprendiz_" + this.instanceId).text(resumo.aprendiz);
        $("#rhAdmissionOutros_" + this.instanceId).text(resumo.outros);

        $("#rhAdmissionSalarioMedio_" + this.instanceId).text(
            this.formatarMoeda(resumo.salarioMedio)
        );

        var meses = {};
        var tipos = {};

        registros.forEach(function (item) {
            var data = RHAdmissionService.parseData(item.DATAADMISSAO);

            if (data) {
                var chaveMes = data.getFullYear() + "-" + String(data.getMonth() + 1).padStart(2, "0");
                var labelMes = String(data.getMonth() + 1).padStart(2, "0") + "/" + data.getFullYear();

                if (!meses[chaveMes]) {
                    meses[chaveMes] = { label: labelMes, valor: 0 };
                }

                meses[chaveMes].valor++;
            }

            var tipo = RHAdmissionService.categoria(item);

            if (!tipos[tipo]) {
                tipos[tipo] = 0;
            }

            tipos[tipo]++;
        });

        var chavesMes = Object.keys(meses).sort();
        var chavesTipo = Object.keys(tipos);

        RHCharts.renderAdmission(this.instanceId, {
            porMes: {
                onClick: function (mes) {
                    RHDrilldown.abrirFiltrado(
                        that.instanceId, that.configDrilldown("total"),
                        function (linha) {
                            var data = RHAdmissionService.parseData(linha.dataAdmissao);

                            return !!data && (
                                String(data.getMonth() + 1).padStart(2, "0") + "/" + data.getFullYear()
                            ) === mes;
                        },
                        mes, "Admissão · Mês"
                    );
                },
                labels: chavesMes.map(function (chave) {
                    return meses[chave].label;
                }),

                valores: chavesMes.map(function (chave) {
                    return meses[chave].valor;
                })
            },

            porTipo: {
                onClick: function (tipo) {
                    RHDrilldown.abrirPorCampo(
                        that.instanceId, that.configDrilldown("total"),
                        "tipo", tipo, "Admissão · Tipo"
                    );
                },
                labels: chavesTipo,
                valores: chavesTipo.map(function (tipo) {
                    return tipos[tipo];
                })
            }
        });

        RHDrilldown.fechar("#rhAdmissionDrilldown_" + this.instanceId);
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
            "#rhAdmission_" + this.instanceId,
            "#rhAdmissionDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registros) {
            return null;
        }

        var servico = RHAdmissionService;

        var filtros = {
            total: function () { return true; },
            clt: function (item) { return servico.categoria(item) === "CLT"; },
            estagio: function (item) { return servico.categoria(item) === "Estágio"; },
            aprendiz: function (item) { return servico.categoria(item) === "Aprendiz"; },
            outros: function (item) { return servico.categoria(item) === "Outros"; },
            salarioMedio: function () { return true; }
        };

        var titulos = {
            total: "Todas as Admissões",
            clt: "Admissões CLT",
            estagio: "Admissões de Estágio",
            aprendiz: "Admissões de Aprendiz",
            outros: "Outras Admissões",
            salarioMedio: "Todas as Admissões (por Salário)"
        };

        if (!filtros[chave]) {
            return null;
        }

        var linhas = this.registros
            .filter(filtros[chave])
            .map(function (item) {
                return {
                    colaborador: item.NOME,
                    cargo: item.NOME_FUNCAO || "-",
                    secao: item.NOME_SECAO || "-",
                    dataAdmissao: item.DATAADMISSAO || "-",
                    tipo: servico.categoria(item),
                    salario: item.SALARIO || "-"
                };
            });

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "colaborador", rotulo: "Colaborador" },
                { campo: "cargo", rotulo: "Cargo" },
                { campo: "secao", rotulo: "Seção" },
                { campo: "dataAdmissao", rotulo: "Data Admissão" },
                { campo: "tipo", rotulo: "Tipo" },
                { campo: "salario", rotulo: "Salário" }
            ],
            linhas: linhas
        };
    }

};

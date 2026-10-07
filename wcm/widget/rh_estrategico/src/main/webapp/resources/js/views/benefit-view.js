var RHBenefitView = {

    instanceId: null,
    registrosTodos: null,
    registros: null,
    janela: null,
    variacoes: [],

    LIMITE_RANKING: 10,
    LIMITE_TABELA_VARIACAO: 24,

    // Campos de filtro locais (só aparecem na aba Benefícios, ver
    // "rh-filter-group--benefit" em filters.css). As opções de cada select
    // são derivadas dos próprios registros já carregados (respeitando
    // período/empresa/filial globais), sem nova busca no servidor.
    // "Centro de custo" não entra: a coluna vem vazia em todo o CSV
    CAMPOS_FILTRO: [
        { id: "rhBenefitSecao_", campoValor: "CODSECAO", campoLabel: "NOME_SECAO", textoTodos: "Todas as seções" },
        { id: "rhBenefitFuncao_", campoValor: "CODFUNCAO", campoLabel: "NOME_FUNCAO", textoTodos: "Todas as funções" },
        { id: "rhBenefitPeriodoFolha_", campoValor: "NROPERIODO", campoLabel: null, textoTodos: "Todos os períodos" }
    ],

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Benefícios inicializada:", instanceId);

        this.bindKpiClicks();
        this.popularFiltroBeneficio();
        this.bindFiltrosLocais();
        this.atualizar();

        RHExport.bind(
            "#rhBenefitExportar_" + instanceId,
            "#rhBenefitCaptura_" + instanceId,
            "beneficios"
        );

        var tabelasExportacao = [
            {
                titulo: "Resumo por Benefício",
                seletor: $("#rhBenefitTabelaBeneficios_" + instanceId).closest("table")[0]
            },
            {
                titulo: "Variação entre Competências",
                seletor: $("#rhBenefitTabelaVariacao_" + instanceId).closest("table")[0]
            }
        ];

        RHPdfExport.bind(
            "#rhBenefitGerarPdf_" + instanceId,
            "beneficios_tabelas",
            "Benefícios - Tabelas Detalhadas",
            tabelasExportacao
        );

        RHXlsxExport.bind(
            "#rhBenefitGerarXlsx_" + instanceId,
            "beneficios_tabelas",
            tabelasExportacao
        );
    },

    // "Possui o benefício": a lista é fixa (o catálogo do serviço), então é
    // montada uma vez só — não depende dos dados carregados
    popularFiltroBeneficio: function () {
        var select = $("#rhBenefitBeneficio_" + this.instanceId);

        select.empty();
        select.append('<option value="">Todos os benefícios</option>');

        RHBenefitService.BENEFICIOS.forEach(function (beneficio) {
            select.append(
                $("<option>", {
                    value: beneficio.campo,
                    text: beneficio.rotulo
                })
            );
        });
    },

    bindFiltrosLocais: function () {
        var that = this;

        this.CAMPOS_FILTRO.forEach(function (campo) {
            $("#" + campo.id + that.instanceId).on("change", function () {
                that.aplicarFiltrosLocais();
            });
        });

        $("#rhBenefitBeneficio_" + this.instanceId).on("change", function () {
            that.aplicarFiltrosLocais();
        });
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();
        var resultado = RHBenefitService.buscar(filtros);

        this.registrosTodos = resultado.registros;
        this.janela = resultado.janela;

        console.log("[RH Estratégico] Dados de Benefícios:", this.registrosTodos.length, "linhas", this.janela);

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

        // "Possui o benefício": só linhas em que aquele benefício tem valor
        var campoBeneficio = $("#rhBenefitBeneficio_" + this.instanceId).val();
        var indiceBeneficio = -1;

        if (campoBeneficio) {
            RHBenefitService.BENEFICIOS.forEach(function (beneficio, i) {
                if (beneficio.campo === campoBeneficio) {
                    indiceBeneficio = i;
                }
            });
        }

        this.registros = (this.registrosTodos || []).filter(function (item) {
            if (indiceBeneficio >= 0 && !(item._valores[indiceBeneficio] > 0)) {
                return false;
            }

            return escolhidos.every(function (escolha) {
                return String(item[escolha.campoValor]) === String(escolha.valor);
            });
        });

        this.renderizar();
    },

    formatarMoeda: function (valor) {
        return RHCharts.formatarMoeda(valor);
    },

    formatarPercentual: function (valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + "%";
    },

    // "+5,3%" / "-2,1%"
    formatarVariacaoPct: function (valor) {
        return (valor >= 0 ? "+" : "-") + this.formatarPercentual(Math.abs(valor));
    },

    // "+R$ 1.234,00" / "-R$ 980,50"
    formatarVariacaoValor: function (valor) {
        return (valor >= 0 ? "+" : "-") + this.formatarMoeda(Math.abs(valor));
    },

    parteDe: function (valor, total) {
        return total > 0 ? this.formatarPercentual((valor / total) * 100) : "0,0%";
    },

    renderizar: function () {
        var that = this;
        var id = this.instanceId;
        var servico = RHBenefitService;
        var registros = this.registros;

        var resumo = servico.calcularResumo(registros);
        var meses = servico.agruparPorMes(registros);
        var variacoes = servico.variacoes(meses);
        var ultimaVariacao = servico.ultimaVariacao(variacoes);
        var porBeneficio = servico.resumoPorBeneficio(registros, resumo);

        this.variacoes = variacoes;

        this.renderizarPeriodo();

        // KPIs
        $("#rhBenefitTotal_" + id).text(this.formatarMoeda(resumo.total));

        $("#rhBenefitEmpresa_" + id).text(this.formatarMoeda(resumo.empresa));
        $("#rhBenefitEmpresaPct_" + id).text(this.parteDe(resumo.empresa, resumo.total) + " do custo total");

        $("#rhBenefitColaborador_" + id).text(this.formatarMoeda(resumo.colaborador));
        $("#rhBenefitColaboradorPct_" + id).text(this.parteDe(resumo.colaborador, resumo.total) + " do custo total");

        $("#rhBenefitColaboradores_" + id).text(resumo.colaboradores);
        $("#rhBenefitColaboradoresInfo_" + id).text(
            resumo.titulares + " titulares · " + resumo.comDependentes + " com dependentes"
        );

        $("#rhBenefitMedia_" + id).text(this.formatarMoeda(resumo.mediaPorColaboradorMes));

        if (ultimaVariacao) {
            $("#rhBenefitVariacao_" + id).text(this.formatarVariacaoPct(ultimaVariacao.deltaPct));
            $("#rhBenefitVariacaoInfo_" + id).text(
                servico.formatarAnoMes(ultimaVariacao.anoMes) + " vs " + servico.formatarAnoMes(ultimaVariacao.anoMesAnterior)
            );
        } else {
            $("#rhBenefitVariacao_" + id).text("—");
            $("#rhBenefitVariacaoInfo_" + id).text("Sem competência anterior pra comparar");
        }

        // Gráficos
        var series = [
            {
                label: servico.GRUPOS.empresa,
                valores: meses.map(function (mes) { return mes.empresa; }),
                cor: "#8b5cf6"
            },
            {
                label: servico.GRUPOS.colaborador,
                valores: meses.map(function (mes) { return mes.colaborador; }),
                cor: "#f97316"
            }
        ];

        if (resumo.outros > 0.005) {
            series.push({
                label: servico.GRUPOS.outros,
                valores: meses.map(function (mes) { return mes.outros; }),
                cor: "#94a3b8"
            });
        }

        var fatias = [
            { chave: "empresa", valor: resumo.empresa, cor: "#8b5cf6" },
            { chave: "colaborador", valor: resumo.colaborador, cor: "#f97316" },
            { chave: "outros", valor: resumo.outros, cor: "#94a3b8" }
        ].filter(function (fatia) {
            return fatia.valor > 0.005;
        });

        var itensBeneficio = porBeneficio.filter(function (item) {
            return item.campo !== null;
        });

        var porColaboradores = itensBeneficio.slice().sort(function (a, b) {
            return b.colaboradores - a.colaboradores;
        });

        var porFilial = servico.agruparPorDimensao(registros, "NOME_FILIAL", "NOME_FILIAL").slice(0, this.LIMITE_RANKING);
        var porSecao = servico.agruparPorDimensao(registros, "NOME_SECAO", "NOME_SECAO").slice(0, this.LIMITE_RANKING);

        RHCharts.renderBenefit(id, {
            mes: {
                labels: meses.map(function (mes) { return servico.formatarAnoMes(mes.anoMes); }),
                series: series,
                onClick: function (rotuloMes) {
                    that.abrirMes(rotuloMes);
                }
            },
            grupo: {
                labels: fatias.map(function (fatia) { return servico.GRUPOS[fatia.chave]; }),
                valores: fatias.map(function (fatia) { return fatia.valor; }),
                cores: fatias.map(function (fatia) { return fatia.cor; }),
                onClick: function (rotulo) {
                    that.abrirGrupo(rotulo);
                }
            },
            beneficio: {
                labels: porBeneficio.map(function (item) { return item.rotulo; }),
                valores: porBeneficio.map(function (item) { return item.total; }),
                onClick: function (rotulo) {
                    that.abrirBeneficio(rotulo, porBeneficio);
                }
            },
            colaboradores: {
                labels: porColaboradores.map(function (item) { return item.rotulo; }),
                valores: porColaboradores.map(function (item) { return item.colaboradores; }),
                onClick: function (rotulo) {
                    that.abrirBeneficio(rotulo, porBeneficio);
                }
            },
            filial: {
                labels: porFilial.map(function (item) { return item.label; }),
                valores: porFilial.map(function (item) { return item.total; }),
                onClick: function (rotulo) {
                    that.abrirDimensao("NOME_FILIAL", rotulo, "Benefícios · Filial");
                }
            },
            secao: {
                labels: porSecao.map(function (item) { return item.label; }),
                valores: porSecao.map(function (item) { return item.total; }),
                onClick: function (rotulo) {
                    that.abrirDimensao("NOME_SECAO", rotulo, "Benefícios · Seção");
                }
            }
        });

        this.renderTabelaBeneficios(porBeneficio);
        this.renderTabelaVariacao(variacoes);

        RHDrilldown.fechar("#rhBenefitDrilldown_" + id);
    },

    // Deixa claro qual janela de competências está na tela — principalmente
    // quando é a padrão, que a pessoa não escolheu. A padrão termina no
    // último mês com lançamento do recorte (empresa/filial), então pra uma
    // empresa sem folha recente ela pode ser bem antiga — daí o texto
    renderizarPeriodo: function () {
        var janela = this.janela;
        var servico = RHBenefitService;
        var texto = "";

        if (janela && janela.inicio) {
            texto = "Competências de " + servico.formatarAnoMes(janela.inicio)
                + " a " + servico.formatarAnoMes(janela.fim);

            if (janela.padrao) {
                texto += " (" + servico.MESES_JANELA_PADRAO + " meses até o último com lançamento — use De/Até pra mudar)";
            }

            if (!this.registros.length) {
                texto += " · nenhum lançamento com os filtros atuais";
            }
        } else {
            texto = "Nenhum lançamento de benefício encontrado";
        }

        $("#rhBenefitPeriodoInfo_" + this.instanceId).text(texto);
    },

    // ---------- Detalhamento (painel lateral) ----------

    // Colunas de valor de cada modo do painel
    colunasPara: function (modo, rotuloFoco) {
        var base = [
            { campo: "nome", rotulo: "Colaborador" },
            { campo: "secao", rotulo: "Seção" },
            { campo: "filial", rotulo: "Filial" }
        ];

        if (modo === "foco") {
            return base.concat([
                { campo: "foco", rotulo: rotuloFoco || "Valor do benefício" },
                { campo: "total", rotulo: "Total geral" },
                { campo: "meses", rotulo: "Meses" }
            ]);
        }

        if (modo === "outros") {
            return base.concat([
                { campo: "outros", rotulo: "Outros eventos" },
                { campo: "total", rotulo: "Total geral" }
            ]);
        }

        return base.concat([
            { campo: "empresa", rotulo: "Empresa" },
            { campo: "colaborador", rotulo: "Descontado" },
            { campo: "total", rotulo: "Total" },
            { campo: "media", rotulo: "Média/mês" }
        ]);
    },

    linhaColaborador: function (colaborador) {
        var meses = colaborador.quantidadeMeses;

        return {
            nome: colaborador.nome,
            secao: colaborador.secao,
            filial: colaborador.filial,
            empresa: this.formatarMoeda(colaborador.empresa),
            colaborador: this.formatarMoeda(colaborador.colaborador),
            outros: this.formatarMoeda(colaborador.outros),
            foco: this.formatarMoeda(colaborador.foco),
            total: this.formatarMoeda(colaborador.total),
            media: this.formatarMoeda(meses > 0 ? colaborador.total / meses : 0),
            meses: meses
        };
    },

    // Abre o painel lateral com uma linha por colaborador do recorte.
    // "ordenarPor" é a coluna de valor (total, empresa, colaborador, outros
    // ou foco) que define a ordem e quem entra (só quem tem valor nela)
    abrirDetalhe: function (opcoes) {
        var that = this;
        var servico = RHBenefitService;

        var colaboradores = servico.porColaborador(opcoes.registros, opcoes.campoFoco || null)
            .filter(function (colaborador) {
                return colaborador[opcoes.ordenarPor] > 0;
            })
            .sort(function (a, b) {
                return b[opcoes.ordenarPor] - a[opcoes.ordenarPor];
            });

        var resumo = servico.calcularResumo(opcoes.registros);
        var metricas;

        if (opcoes.ordenarPor === "foco") {
            var totalFoco = colaboradores.reduce(function (soma, colaborador) {
                return soma + colaborador.foco;
            }, 0);

            metricas = [
                { label: "Total do benefício", valor: this.formatarMoeda(totalFoco), descricao: "No período exibido" },
                { label: "Colaboradores", valor: colaboradores.length, descricao: "Com este benefício" },
                {
                    label: "Média por colaborador",
                    valor: this.formatarMoeda(colaboradores.length ? totalFoco / colaboradores.length : 0),
                    descricao: "No período exibido"
                }
            ];
        } else {
            metricas = [
                { label: "Custo total", valor: this.formatarMoeda(resumo.total), descricao: "No recorte" },
                { label: "Empresa", valor: this.formatarMoeda(resumo.empresa), descricao: this.parteDe(resumo.empresa, resumo.total) + " do total" },
                { label: "Descontado", valor: this.formatarMoeda(resumo.colaborador), descricao: this.parteDe(resumo.colaborador, resumo.total) + " do total" },
                { label: "Colaboradores", valor: resumo.colaboradores, descricao: "Com benefício" }
            ];
        }

        var modo = opcoes.ordenarPor === "foco" || opcoes.ordenarPor === "outros"
            ? opcoes.ordenarPor
            : "padrao";

        RHDrilldown.abrirPainel(
            this.instanceId,
            opcoes.eyebrow,
            opcoes.titulo,
            opcoes.subtitulo,
            this.colunasPara(modo, opcoes.rotuloFoco),
            colaboradores.map(function (colaborador) {
                return that.linhaColaborador(colaborador);
            }),
            metricas
        );
    },

    // "09/2026" -> registros da competência 2026-09
    abrirMes: function (rotuloMes) {
        var partes = String(rotuloMes).split("/");
        var anoMes = partes.length === 2 ? partes[1] + "-" + partes[0] : rotuloMes;

        this.abrirDetalhe({
            eyebrow: "Benefícios · Competência",
            titulo: rotuloMes,
            subtitulo: "Colaboradores com benefício nesta competência.",
            registros: this.registros.filter(function (item) {
                return item.ANO_MES === anoMes;
            }),
            ordenarPor: "total"
        });
    },

    abrirGrupo: function (rotulo) {
        var grupos = RHBenefitService.GRUPOS;
        var chave = null;

        Object.keys(grupos).forEach(function (candidata) {
            if (grupos[candidata] === rotulo) {
                chave = candidata;
            }
        });

        if (!chave) {
            return;
        }

        this.abrirDetalhe({
            eyebrow: "Benefícios · Quem custeia",
            titulo: rotulo,
            subtitulo: "Colaboradores com valor neste grupo, do maior pro menor.",
            registros: this.registros,
            ordenarPor: chave
        });
    },

    // Clique num benefício (gráficos e tabela): colaboradores que o têm
    abrirBeneficio: function (rotulo, itens) {
        var item = null;

        itens.forEach(function (candidato) {
            if (candidato.rotulo === rotulo) {
                item = candidato;
            }
        });

        if (!item) {
            return;
        }

        if (item.campo === null) {
            this.abrirGrupo(RHBenefitService.GRUPOS.outros);
            return;
        }

        this.abrirDetalhe({
            eyebrow: "Benefícios · Benefício",
            titulo: rotulo,
            subtitulo: "Colaboradores com este benefício, do maior valor pro menor.",
            registros: this.registros,
            campoFoco: item.campo,
            ordenarPor: "foco",
            rotuloFoco: "Valor do benefício"
        });
    },

    abrirDimensao: function (campo, valor, eyebrow) {
        this.abrirDetalhe({
            eyebrow: eyebrow,
            titulo: valor,
            subtitulo: "Colaboradores deste recorte, do maior custo pro menor.",
            registros: this.registros.filter(function (item) {
                return (item[campo] || "-") === valor;
            }),
            ordenarPor: "total"
        });
    },

    // ---------- KPIs (clique/hover) ----------

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhBenefit_" + this.instanceId,
            "#rhBenefitDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        var that = this;

        if (!this.registros) {
            return null;
        }

        if (chave === "variacao") {
            return {
                titulo: "Variação entre Competências",
                colunas: [
                    { campo: "competencia", rotulo: "Competência" },
                    { campo: "total", rotulo: "Total" },
                    { campo: "variacaoValor", rotulo: "Variação (R$)" },
                    { campo: "variacaoPct", rotulo: "Variação (%)" }
                ],
                linhas: this.variacoes.slice().reverse().map(function (item) {
                    return that.linhaVariacao(item);
                })
            };
        }

        var regras = {
            total: { titulo: "Custo Total por Colaborador", ordenarPor: "total" },
            colaboradores: { titulo: "Colaboradores com Benefício", ordenarPor: "total" },
            media: { titulo: "Média Mensal por Colaborador", ordenarPor: "total" },
            empresa: { titulo: "Custeado pela Empresa, por Colaborador", ordenarPor: "empresa" },
            colaborador: { titulo: "Descontado dos Colaboradores", ordenarPor: "colaborador" }
        };

        var regra = regras[chave];

        if (!regra) {
            return null;
        }

        var colaboradores = RHBenefitService.porColaborador(this.registros, null)
            .filter(function (colaborador) {
                return colaborador[regra.ordenarPor] > 0;
            })
            .sort(function (a, b) {
                return b[regra.ordenarPor] - a[regra.ordenarPor];
            });

        return {
            titulo: regra.titulo,
            colunas: this.colunasPara("padrao"),
            linhas: colaboradores.map(function (colaborador) {
                return that.linhaColaborador(colaborador);
            })
        };
    },

    // ---------- Tabelas ----------

    linhaVariacao: function (item) {
        var servico = RHBenefitService;

        return {
            competencia: servico.formatarAnoMes(item.anoMes) + (item.emAndamento ? " (em andamento)" : ""),
            total: this.formatarMoeda(item.total),
            variacaoValor: item.deltaValor === null ? "—" : this.formatarVariacaoValor(item.deltaValor),
            variacaoPct: item.deltaPct === null ? "—" : this.formatarVariacaoPct(item.deltaPct)
        };
    },

    renderTabelaBeneficios: function (itens) {
        var that = this;
        var corpo = $("#rhBenefitTabelaBeneficios_" + this.instanceId);
        var tipos = { empresa: "Empresa", colaborador: "Colaborador", outros: "Outros" };

        corpo.empty();

        if (itens.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 6, "class": "rh-table-empty", text: "Nenhum benefício no período selecionado" })
                )
            );

            return;
        }

        itens.forEach(function (item) {
            var linha = $("<tr>");

            linha.append($("<td>").text(item.rotulo));
            linha.append($("<td>").text(tipos[item.grupo] || "-"));
            linha.append($("<td>").text(item.colaboradores === null ? "-" : item.colaboradores));
            linha.append($("<td>").text(that.formatarMoeda(item.total)));
            linha.append($("<td>").text(item.media === null ? "-" : that.formatarMoeda(item.media)));
            linha.append($("<td>").text(that.formatarPercentual(item.percentual)));

            corpo.append(linha);
        });
    },

    // Mais recente primeiro. Linhas com variação acima do limite ganham cor
    // (alta de custo em vermelho, queda em verde) e um texto de situação,
    // que também sai nas exportações de PDF/planilha
    renderTabelaVariacao: function (variacoes) {
        var that = this;
        var limite = RHBenefitService.VARIACAO_RELEVANTE_PCT;
        var corpo = $("#rhBenefitTabelaVariacao_" + this.instanceId);

        corpo.empty();

        if (variacoes.length === 0) {
            corpo.append(
                $("<tr>").append(
                    $("<td>", { colspan: 5, "class": "rh-table-empty", text: "Nenhuma competência no período selecionado" })
                )
            );

            return;
        }

        variacoes
            .slice()
            .reverse()
            .slice(0, this.LIMITE_TABELA_VARIACAO)
            .forEach(function (item) {
                var dados = that.linhaVariacao(item);
                var situacao = "—";
                var classe = "";

                if (item.emAndamento) {
                    situacao = "Em andamento";
                } else if (item.deltaPct !== null) {
                    if (item.deltaPct >= limite) {
                        situacao = "Alta relevante";
                        classe = "rh-benefit-var--alta";
                    } else if (item.deltaPct <= -limite) {
                        situacao = "Queda relevante";
                        classe = "rh-benefit-var--queda";
                    } else {
                        situacao = "Normal";
                    }
                }

                var linha = $("<tr>");

                linha.append($("<td>").text(dados.competencia));
                linha.append($("<td>").text(dados.total));
                linha.append($("<td>", { "class": classe }).text(dados.variacaoValor));
                linha.append($("<td>", { "class": classe }).text(dados.variacaoPct));
                linha.append($("<td>", { "class": classe }).text(situacao));

                corpo.append(linha);
            });
    }

};

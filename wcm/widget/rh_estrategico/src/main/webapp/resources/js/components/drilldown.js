var RHDrilldown = {

    // Id da instância = sufixo do seletor ("#rhContractDrilldown_123" -> "123")
    instanciaDe: function (painelSeletor) {
        return String(painelSeletor).split("_").pop();
    },

    // Abre o mesmo painel lateral usado na aba Férias
    abrirPainel: function (instanceId, eyebrow, titulo, subtitulo, colunas, linhas, metricas) {
        RHDetailPanel.open({
            instanceId: instanceId,
            eyebrow: eyebrow || "Detalhamento",
            titulo: titulo,
            subtitulo: subtitulo || "Registros que compõem este indicador.",
            metricas: metricas || [
                {
                    label: "Registros",
                    valor: (linhas || []).length,
                    descricao: "No filtro atual"
                }
            ],
            colunas: colunas,
            linhas: linhas || []
        });
    },

    // Abre o painel com as linhas de "config" cujo campo == valor
    // (usado no clique de fatia de rosca)
    abrirPorCampo: function (instanceId, config, campo, valor, eyebrow) {
        if (!config) {
            return;
        }

        var linhas = (config.linhas || []).filter(function (item) {
            return String(item[campo]) === String(valor);
        });

        this.abrirPainel(
            instanceId,
            eyebrow,
            valor,
            "Registros nesta categoria.",
            config.colunas,
            linhas
        );
    },

    // Abre o painel com as linhas de "config" que passam no predicado
    abrirFiltrado: function (instanceId, config, predicado, titulo, eyebrow) {
        if (!config) {
            return;
        }

        this.abrirPainel(
            instanceId,
            eyebrow,
            titulo,
            "Registros neste item.",
            config.colunas,
            (config.linhas || []).filter(predicado)
        );
    },

    render: function (painelSeletor, titulo, colunas, linhas) {
        if (typeof RHDetailPanel !== "undefined") {
            this.abrirPainel(
                this.instanciaDe(painelSeletor), null, titulo, null, colunas, linhas
            );
            return;
        }

        var painel = $(painelSeletor);

        var header = $("<div>", { "class": "rh-drilldown-header" });
        header.append($("<h3>").text(titulo));
        header.append($("<button>", { type: "button", "class": "rh-drilldown-close", text: "Fechar" }));

        var tabela = $("<table>", { "class": "rh-table" });
        var linhaCabecalho = $("<tr>");

        colunas.forEach(function (coluna) {
            linhaCabecalho.append($("<th>").text(coluna.rotulo));
        });

        tabela.append($("<thead>").append(linhaCabecalho));

        var tbody = $("<tbody>");

        if (!linhas || linhas.length === 0) {
            tbody.append(
                $("<tr>").append(
                    $("<td>", { colspan: colunas.length, "class": "rh-table-empty", text: "Nenhum registro encontrado" })
                )
            );
        } else {
            linhas.forEach(function (item) {
                var linha = $("<tr>");

                colunas.forEach(function (coluna) {
                    linha.append($("<td>").text(item[coluna.campo]));
                });

                tbody.append(linha);
            });
        }

        tabela.append(tbody);

        painel.empty().append(header).append(tabela);
        painel.addClass("rh-drilldown--aberto");

        painel.find(".rh-drilldown-close")
            .off("click.rhDrilldown")
            .on("click.rhDrilldown", function () {
                painel.removeClass("rh-drilldown--aberto").empty();
            });

        painel[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
    },

    // Cache do resolver por chave (montar a config percorre todos os
    // registros); é descartado a cada re-render, que sempre chama "fechar"
    cache: {},

    fechar: function (painelSeletor) {
        this.cache = {};

        $(painelSeletor).removeClass("rh-drilldown--aberto").empty();
    },

    // Resumo exibido no hover do KPI: total de registros + principais
    // agrupamentos pela primeira coluna "categórica" (status, tipo, seção...)
    montarHover: function (card, config) {
        card.find(".rh-kpi-hover").remove();

        var linhas = config.linhas || [];
        var colunas = config.colunas || [];
        var coluna = null;

        colunas.forEach(function (c, i) {
            if (!coluna && i > 0 && /status|tipo|se[cç][aã]o|motivo|situa|filial|categoria|departamento/i.test(c.rotulo)) {
                coluna = c;
            }
        });

        var hover = $("<div>", { "class": "rh-kpi-hover" });
        var titulo = card.find(".rh-kpi-label").first().text();

        hover.append($("<div>", { "class": "rh-kpi-hover-title", text: titulo }));

        var linhaDe = function (rotulo, valor) {
            return $("<div>", { "class": "rh-kpi-hover-row" })
                .append($("<span>").text(rotulo))
                .append($("<strong>").text(valor));
        };

        hover.append(linhaDe("Registros", linhas.length));

        if (coluna && linhas.length) {
            var contagem = {};

            linhas.forEach(function (item) {
                var chave = item[coluna.campo];

                if (chave === undefined || chave === null || chave === "") {
                    chave = "-";
                }

                contagem[chave] = (contagem[chave] || 0) + 1;
            });

            Object.keys(contagem)
                .sort(function (a, b) { return contagem[b] - contagem[a]; })
                .slice(0, 3)
                .forEach(function (chave) {
                    hover.append(linhaDe(chave, contagem[chave]));
                });
        }

        hover.append($("<span>", {
            "class": "rh-kpi-hover-footer",
            text: "Clique para detalhar"
        }));

        card.append(hover);
    },

    bind: function (rootSeletor, painelSeletor, resolver) {
        var that = this;
        var root = $(rootSeletor);

        var resolverComCache = function (chave) {
            var id = rootSeletor + "|" + chave;

            if (!(id in that.cache)) {
                that.cache[id] = resolver(chave);
            }

            return that.cache[id];
        };

        // KPIs (com hover informativo) e cards de tabela (só clique)
        root.find(".rh-kpi-card[data-rh-kpi]")
            .off("mouseenter.rhDrilldown")
            .on("mouseenter.rhDrilldown", function () {
                var card = $(this);
                var config = resolverComCache(card.data("rh-kpi"));

                if (config) {
                    that.montarHover(card, config);
                }
            });

        root.find(".rh-kpi-card[data-rh-kpi], .rh-table-card[data-rh-kpi]")
            .off("click.rhDrilldown")
            .on("click.rhDrilldown", function () {
                var config = resolverComCache($(this).data("rh-kpi"));

                if (!config) {
                    return;
                }

                that.render(painelSeletor, config.titulo, config.colunas, config.linhas);
            });
    }

};

var RHDrilldown = {

    render: function (painelSeletor, titulo, colunas, linhas) {
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

    fechar: function (painelSeletor) {
        $(painelSeletor).removeClass("rh-drilldown--aberto").empty();
    },

    bind: function (rootSeletor, painelSeletor, resolver) {
        var that = this;
        var root = $(rootSeletor);

        root.find(".rh-kpi-card[data-rh-kpi]")
            .off("click.rhDrilldown")
            .on("click.rhDrilldown", function () {
                var config = resolver($(this).data("rh-kpi"));

                if (!config) {
                    return;
                }

                that.render(painelSeletor, config.titulo, config.colunas, config.linhas);
            });
    }

};

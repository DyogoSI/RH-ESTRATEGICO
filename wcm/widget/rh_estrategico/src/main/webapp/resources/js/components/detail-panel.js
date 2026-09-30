var RHDetailPanel = {

    open: function (config) {
        if (!config || !config.instanceId) {
            return;
        }

        this.close(config.instanceId, true);

        var overlay = $("<div>", {
            id: "rhDetailOverlay_" + config.instanceId,
            "class": "rh-detail-overlay",
            "aria-hidden": "true"
        });

        var panel = $("<section>", {
            "class": "rh-detail-panel",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "rhDetailTitle_" + config.instanceId
        });

        if (config.panelClass) {
            panel.addClass(config.panelClass);
        }

        var header = this.criarHeader(config);

        var body = $("<div>", {
            "class": "rh-detail-panel-body"
        });

        if (config.metricas && config.metricas.length) {
            body.append(
                this.criarMetricas(config.metricas)
            );
        }

        if (config.conteudo) {
            body.append(config.conteudo);
        }

        if (config.colunas && config.linhas) {
            body.append(
                this.criarTabela(
                    config.colunas,
                    config.linhas
                )
            );
        }

        panel
            .append(header)
            .append(body);

        overlay.append(panel);

        $("#RHEstrategico_" + config.instanceId)
            .append(overlay);

        this.bindEventos(
            overlay,
            panel,
            config.instanceId
        );

        window.setTimeout(function () {
            overlay
                .addClass("rh-detail-overlay--visible")
                .attr("aria-hidden", "false");

            if (typeof config.afterOpen === "function") {
                config.afterOpen({
                    overlay: overlay,
                    panel: panel,
                    body: body
                });
            }
        }, 10);
    },

    criarHeader: function (config) {
        var header = $("<div>", {
            "class": "rh-detail-panel-header"
        });

        var textos = $("<div>", {
            "class": "rh-detail-panel-heading"
        });

        if (config.eyebrow) {
            textos.append(
                $("<span>", {
                    "class": "rh-detail-panel-eyebrow",
                    text: config.eyebrow
                })
            );
        }

        textos.append(
            $("<h2>", {
                id: "rhDetailTitle_" + config.instanceId,
                text: config.titulo || "Detalhes"
            })
        );

        if (config.subtitulo) {
            textos.append(
                $("<p>", {
                    text: config.subtitulo
                })
            );
        }

        var fechar = $("<button>", {
            type: "button",
            "class": "rh-detail-panel-close",
            "aria-label": "Fechar",
            html: "&times;"
        });

        return header
            .append(textos)
            .append(fechar);
    },


    criarMetricas: function (metricas) {
        var grid = $("<div>", {
            "class": "rh-detail-metrics"
        });

        metricas.forEach(function (metrica) {
            var card = $("<div>", {
                "class": "rh-detail-metric"
            });

            if (metrica.destaque) {
                card.addClass(
                    "rh-detail-metric--" + metrica.destaque
                );
            }

            card.append(
                $("<span>", {
                    "class": "rh-detail-metric-label",
                    text: metrica.label
                })
            );

            card.append(
                $("<strong>", {
                    "class": "rh-detail-metric-value",
                    text: metrica.valor
                })
            );

            if (metrica.descricao) {
                card.append(
                    $("<span>", {
                        "class": "rh-detail-metric-description",
                        text: metrica.descricao
                    })
                );
            }

            grid.append(card);
        });

        return grid;
    },


    criarTabela: function (colunas, linhas) {
        var bloco = $("<div>", {
            "class": "rh-detail-table-block"
        });

        bloco.append(
            $("<div>", {
                "class": "rh-detail-block-title",
                text: "Colaboradores"
            })
        );

        var container = $("<div>", {
            "class": "rh-detail-table-container"
        });

        var tabela = $("<table>", {
            "class": "rh-detail-table"
        });

        var cabecalho = $("<tr>");

        colunas.forEach(function (coluna) {
            cabecalho.append(
                $("<th>").text(coluna.rotulo)
            );
        });

        tabela.append(
            $("<thead>").append(cabecalho)
        );

        var tbody = $("<tbody>");

        if (!linhas || !linhas.length) {
            tbody.append(
                $("<tr>").append(
                    $("<td>", {
                        colspan: colunas.length,
                        "class": "rh-detail-empty",
                        text: "Nenhum registro encontrado"
                    })
                )
            );
        } else {
            linhas.forEach(function (item) {
                var linha = $("<tr>");

                colunas.forEach(function (coluna) {
                    linha.append(
                        $("<td>").text(
                            item[coluna.campo] !== undefined
                                ? item[coluna.campo]
                                : "-"
                        )
                    );
                });

                tbody.append(linha);
            });
        }

        tabela.append(tbody);

        container.append(tabela);
        bloco.append(container);

        return bloco;
    },


    bindEventos: function (overlay, panel, instanceId) {
        var that = this;

        overlay
            .find(".rh-detail-panel-close")
            .on("click.rhDetailPanel", function () {
                that.close(instanceId);
            });

        overlay.on("click.rhDetailPanel", function (event) {
            if (event.target === overlay[0]) {
                that.close(instanceId);
            }
        });

        $(document)
            .off("keydown.rhDetailPanel")
            .on("keydown.rhDetailPanel", function (event) {
                if (event.key === "Escape" || event.keyCode === 27) {
                    that.close(instanceId);
                }
            });

        panel.on("click.rhDetailPanel", function (event) {
            event.stopPropagation();
        });
    },

    close: function (instanceId, immediate) {
        var overlay = $("#rhDetailOverlay_" + instanceId);

        if (!overlay.length) {
            return;
        }

        $(document).off("keydown.rhDetailPanel");

        overlay.trigger("rhDetailPanel:close");

        if (immediate) {
            overlay.remove();
            return;
        }

        overlay
            .removeClass("rh-detail-overlay--visible")
            .attr("aria-hidden", "true");

        window.setTimeout(function () {
            overlay.remove();
        }, 260);
    }

};
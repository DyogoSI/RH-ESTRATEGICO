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

            RHDetailPanel.animarAbertura(panel[0], overlay[0]);

            if (typeof config.afterOpen === "function") {
                config.afterOpen({
                    overlay: overlay,
                    panel: panel,
                    body: body
                });
            }
        }, 10);
    },

    // Origem do clique (card/linha/gráfico): guardada no mousedown. Nos cards
    // de KPI o próprio card (clonado) cresce, gira em 3D até ficar de perfil e
    // vira o painel do outro lado, como num flip de carta; nos demais casos o
    // painel nasce da posição clicada e gira até o centro
    origemClique: null,

    registrarOrigem: function () {
        if (this._origemRegistrada) {
            return;
        }

        this._origemRegistrada = true;

        document.addEventListener("mousedown", function (event) {
            var alvo = event.target && event.target.closest
                ? event.target.closest(".rh-kpi-card, .rh-chart-card, .rh-card, tr, button, canvas")
                : null;

            var rect = alvo
                ? alvo.getBoundingClientRect()
                : { left: event.clientX - 40, top: event.clientY - 20, width: 80, height: 40 };

            RHDetailPanel.origemClique = {
                cx: rect.left + rect.width / 2,
                cy: rect.top + rect.height / 2,
                largura: rect.width,
                altura: rect.height,
                left: rect.left,
                top: rect.top,
                card: alvo && alvo.classList.contains("rh-kpi-card") ? alvo : null,
                quando: Date.now()
            };
        }, true);
    },

    reduzirMovimento: function () {
        return !!(window.matchMedia
            && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    },

    // Clone do card clicado, posicionado exatamente sobre ele
    criarCloneCard: function (origem) {
        var clone = origem.card.cloneNode(true);

        clone.removeAttribute("id");

        var comId = clone.querySelectorAll("[id]");

        for (var i = 0; i < comId.length; i++) {
            comId[i].removeAttribute("id");
        }

        clone.classList.add("rh-detail-flip-card");

        clone.style.cssText =
            "position:fixed;margin:0;box-sizing:border-box;pointer-events:none;"
            + "left:" + origem.left + "px;top:" + origem.top + "px;"
            + "width:" + origem.largura + "px;height:" + origem.altura + "px;"
            + "transform-origin:center center;will-change:transform;z-index:2;";

        return clone;
    },

    animarAbertura: function (painel, overlay) {
        if (!painel || typeof painel.animate !== "function" || this.reduzirMovimento()) {
            return;
        }

        var origem = this.origemClique;
        var largura = painel.offsetWidth;
        var altura = painel.offsetHeight;

        if (!largura || !altura) {
            return;
        }

        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var recente = origem && Date.now() - origem.quando < 4000;

        this._trajetoria = null;

        // Flip de carta: o card cresce, gira até ficar de perfil e o painel
        // continua o giro pelo outro lado
        if (recente && origem.card && overlay) {
            var clone = this.criarCloneCard(origem);

            overlay.appendChild(clone);

            var escala = Math.min(3.4, Math.max(1.3, Math.min(vw * 0.4, 560) / origem.largura));
            var dx = vw / 2 - origem.cx;
            var dy = vh / 2 - origem.cy;
            var duracaoCard = 340;
            var duracaoPainel = 520;

            // O card de origem some do lugar enquanto o clone voa; volta ao fechar
            this.restaurarCard();
            origem.card.style.visibility = "hidden";
            this._cardOculto = origem.card;

            this._trajetoria = {
                flip: true,
                dx: dx,
                dy: dy,
                escala: escala,
                clone: clone,
                cardCx: origem.cx,
                cardCy: origem.cy,
                cardAltura: origem.altura
            };

            var animCard = clone.animate([
                {
                    transform: "translate(0, 0) scale(1) rotateY(0deg)",
                    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.25)"
                },
                {
                    offset: 0.3,
                    transform: "translate(" + (dx * 0.5) + "px, " + (dy * 0.5) + "px) scale(" + (1 + (escala - 1) * 0.85) + ") rotateY(14deg)",
                    boxShadow: "0 30px 70px rgba(15, 23, 42, 0.45)"
                },
                {
                    offset: 0.6,
                    transform: "translate(" + dx + "px, " + dy + "px) scale(" + escala + ") rotateY(22deg)",
                    boxShadow: "0 36px 80px rgba(15, 23, 42, 0.45)"
                },
                {
                    transform: "translate(" + dx + "px, " + dy + "px) scale(" + (escala * 0.9) + ") rotateY(90deg)",
                    boxShadow: "0 36px 80px rgba(15, 23, 42, 0.45)"
                }
            ], {
                duration: duracaoCard,
                easing: "cubic-bezier(0.3, 0.7, 0.35, 1)",
                fill: "forwards"
            });

            animCard.onfinish = function () {
                clone.style.visibility = "hidden";
            };

            painel.animate([
                {
                    opacity: 0,
                    transform: "translate(" + (vw * 0.1) + "px, 0) scale(0.62) rotateY(-90deg)"
                },
                {
                    opacity: 1,
                    offset: 0.02,
                    transform: "translate(" + (vw * 0.1) + "px, 0) scale(0.62) rotateY(-88deg)"
                },
                {
                    opacity: 1,
                    offset: 0.4,
                    transform: "translate(" + (vw * 0.05) + "px, 0) scale(0.8) rotateY(-45deg)"
                },
                {
                    opacity: 1,
                    transform: "translate(0, 0) scale(1) rotateY(0deg)"
                }
            ], {
                delay: duracaoCard - 20,
                duration: duracaoPainel,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                fill: "both"
            });

            return;
        }

        // Sem card de KPI: o painel nasce da posição clicada e gira até o centro
        var dx2 = 0;
        var dy2 = 0;
        var escala2 = 0.4;

        if (recente) {
            dx2 = origem.cx - vw / 2;
            dy2 = origem.cy - vh / 2;
            escala2 = Math.min(0.6, Math.max(0.12, origem.largura / largura));
        }

        this._trajetoria = { dx: dx2, dy: dy2, escala: escala2 };

        painel.animate([
            {
                opacity: 0,
                transform: "translate(" + dx2 + "px, " + dy2 + "px) scale(" + escala2 + ") rotateY(-90deg)"
            },
            {
                opacity: 1,
                offset: 0.3,
                transform: "translate(" + (dx2 * 0.35) + "px, " + (dy2 * 0.35) + "px) scale(" + (escala2 + (1 - escala2) * 0.55) + ") rotateY(-62deg)"
            },
            {
                opacity: 1,
                transform: "translate(0, 0) scale(1) rotateY(0deg)"
            }
        ], {
            duration: 720,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)"
        });
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
            // Renderiza em lotes (HTML em string) para não travar com
            // milhares de linhas: o 1º lote vai na hora e o resto vem
            // conforme o usuário rola a tabela
            var LOTE = 150;
            var posicao = 0;

            var escapar = function (valor) {
                return String(valor)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
            };

            var htmlLote = function () {
                var html = [];
                var fim = Math.min(posicao + LOTE, linhas.length);

                for (; posicao < fim; posicao++) {
                    var item = linhas[posicao];
                    html.push("<tr>");

                    for (var c = 0; c < colunas.length; c++) {
                        var valor = item[colunas[c].campo];
                        html.push("<td>" + escapar(valor !== undefined ? valor : "-") + "</td>");
                    }

                    html.push("</tr>");
                }

                return html.join("");
            };

            tbody.html(htmlLote());

            // Quem rola é o corpo do painel (não a tabela), que só existe
            // no DOM depois que o painel é montado
            window.setTimeout(function () {
                var alvo = container.closest(".rh-detail-panel-body");

                if (!alvo.length) {
                    return;
                }

                var carregarMais = function () {
                    var el = alvo[0];

                    while (
                        posicao < linhas.length
                        && el.scrollTop + el.clientHeight >= el.scrollHeight - 200
                    ) {
                        tbody.append(htmlLote());
                    }
                };

                alvo.on("scroll.rhDetailLote", carregarMais);
            }, 0);
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
            this.restaurarCard();
            overlay.remove();
            return;
        }

        var painel = overlay.find(".rh-detail-panel")[0];
        var traj = this._trajetoria;

        if (painel && traj && !this.reduzirMovimento() && typeof painel.animate === "function") {
            this._fecharComAnimacao(overlay, painel, traj);
            return;
        }

        overlay
            .removeClass("rh-detail-overlay--visible")
            .attr("aria-hidden", "true");

        window.setTimeout(function () {
            overlay.remove();
        }, 260);
    },

    restaurarCard: function () {
        var card = this._cardOculto;

        if (!card) {
            return;
        }

        this._cardOculto = null;

        // Sem transição ao reaparecer: com o mouse por cima, o hover (subida de 2px
        // e tooltip) animaria depois do clone sair e daria um "esticão" no final
        card.classList.add("rh-sem-transicao");
        card.style.visibility = "";

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                card.classList.remove("rh-sem-transicao");
            });
        });
    },

    // Fechamento reverso da abertura
    _fecharComAnimacao: function (overlay, painel, traj) {
        var vw = window.innerWidth;
        var terminado = false;

        var remover = function () {
            if (terminado) {
                return;
            }

            terminado = true;
            RHDetailPanel.restaurarCard();
            overlay.remove();
        };

        // Garantia caso o onfinish não dispare (aba em segundo plano)
        window.setTimeout(remover, 1100);

        overlay.attr("aria-hidden", "true");

        if (traj.flip && traj.clone) {
            var clone = traj.clone;
            var pLargura = painel.offsetWidth || 1;
            var pAltura = painel.offsetHeight || 1;
            var tx = traj.cardCx - window.innerWidth / 2;
            var ty = traj.cardCy - window.innerHeight / 2;
            // 0.88: a perspectiva aumenta a borda mais próxima, então o traço final fica da altura do card
            var escalaFim = Math.min(0.5, Math.max(0.08, (traj.cardAltura / pAltura) * 0.88));

            // O fundo escurecido some de uma vez, sem fade (como no vídeo)
            overlay.css({
                transition: "none",
                background: "transparent",
                "-webkit-backdrop-filter": "none",
                "backdrop-filter": "none",
                // Perspectiva própria em cada elemento (no transform): com a do
                // overlay, o painel longe do centro ficava esticado/distorcido
                perspective: "none"
            });

            // 1) o painel encolhe indo até o card e gira até ficar de perfil
            var animPainel = painel.animate([
                {
                    opacity: 1,
                    transform: "perspective(1800px) translate(0, 0) scale3d(1, 1, 1) rotateY(0deg)"
                },
                {
                    opacity: 1,
                    offset: 0.4,
                    transform: "perspective(1800px) translate(" + (tx * 0.3) + "px, " + (ty * 0.3) + "px) scale3d(0.68, 0.68, 0.68) rotateY(-16deg)"
                },
                {
                    opacity: 1,
                    offset: 0.8,
                    transform: "perspective(1800px) translate(" + (tx * 0.85) + "px, " + (ty * 0.85) + "px) scale3d(" + (escalaFim * 1.5) + ", " + (escalaFim * 1.5) + ", " + (escalaFim * 1.5) + ") rotateY(-62deg)"
                },
                {
                    opacity: 1,
                    transform: "perspective(1800px) translate(" + tx + "px, " + ty + "px) scale3d(" + escalaFim + ", " + escalaFim + ", " + escalaFim + ") rotateY(-90deg)"
                }
            ], {
                duration: 340,
                easing: "cubic-bezier(0.3, 0.6, 0.4, 1)",
                fill: "forwards"
            });

            animPainel.onfinish = function () {
                // 2) o card aparece no lugar de origem, levantado, e assenta
                painel.style.visibility = "hidden";
                clone.style.visibility = "visible";

                var animCard = clone.animate([
                    {
                        transform: "perspective(1800px) translate(0, 0) scale3d(0.96, 0.96, 0.96) rotateY(78deg)",
                        boxShadow: "0 30px 70px rgba(15, 23, 42, 0.45)"
                    },
                    {
                        offset: 0.25,
                        transform: "perspective(1800px) translate(0, -4px) scale3d(1.09, 1.09, 1.09) rotateY(-9deg)",
                        boxShadow: "0 30px 70px rgba(15, 23, 42, 0.4)"
                    },
                    {
                        offset: 0.6,
                        transform: "perspective(1800px) translate(0, -2px) scale3d(1.04, 1.04, 1.04) rotateY(3deg)",
                        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.3)"
                    },
                    {
                        transform: "perspective(1800px) translate(0, 0) scale3d(1, 1, 1) rotateY(0deg)",
                        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.25)"
                    }
                ], {
                    duration: 380,
                    easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
                    fill: "forwards"
                });

                animCard.onfinish = remover;
            };

            return;
        }

        overlay.removeClass("rh-detail-overlay--visible");

        var anim = painel.animate([
            {
                opacity: 1,
                transform: "translate(0, 0) scale(1) rotateY(0deg)"
            },
            {
                opacity: 1,
                offset: 0.45,
                transform: "translate(" + (traj.dx * 0.35) + "px, " + (traj.dy * 0.35) + "px) scale(" + (traj.escala + (1 - traj.escala) * 0.55) + ") rotateY(-62deg)"
            },
            {
                opacity: 0,
                transform: "translate(" + traj.dx + "px, " + traj.dy + "px) scale(" + traj.escala + ") rotateY(-90deg)"
            }
        ], {
            duration: 480,
            easing: "cubic-bezier(0.55, 0, 0.78, 0.4)",
            fill: "forwards"
        });

        overlay.css("transition-duration", "480ms");
        anim.onfinish = remover;
    }

};

RHDetailPanel.registrarOrigem();

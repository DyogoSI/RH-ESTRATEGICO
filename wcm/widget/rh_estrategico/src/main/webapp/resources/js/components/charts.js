var RHCharts = {

    instances: {},
    temaEscuro: false,
    pluginBrilhoRegistrado: false,

    // Plugin do Chart.js que desenha um brilho neon (halo desfocado) ao
    // redor da fatia de rosca/pizza que está com o mouse em cima, em vez
    // do anel branco simples. Lê a cor "pura" da fatia salva em
    // dataset.rhCoresBase (a cor final do gradiente é um CanvasGradient,
    // que não serve como shadowColor). Registrado uma única vez
    registrarPluginBrilho: function () {
        if (this.pluginBrilhoRegistrado || typeof Chart === "undefined") {
            return;
        }

        this.pluginBrilhoRegistrado = true;

        var that = this;

        Chart.register({
            id: "rhBrilhoHover",

            // afterDatasetsDraw (não afterDraw) de propósito: roda antes do
            // tooltip nativo do Chart.js ser desenhado, senão o brilho
            // pintava por cima do tooltip e "lavava"/cortava o texto dele
            afterDatasetsDraw: function (chart) {
                var ativos = chart.getActiveElements();

                if (!ativos || !ativos.length) {
                    return;
                }

                var ctx = chart.ctx;
                var chartArea = chart.chartArea;

                ativos.forEach(function (ativo) {
                    var el = ativo.element;
                    var dataset = chart.data.datasets[ativo.datasetIndex];

                    ctx.save();

                    // Trava o desenho dentro da área do gráfico (nunca
                    // invade a legenda). O raio do anel agora tem uma folga
                    // (ver "radius" na config de cada gráfico) então o
                    // brilho tem espaço pra apagar suavemente antes de
                    // chegar nessa borda, em vez de ser cortado em seco
                    ctx.beginPath();
                    ctx.rect(
                        chartArea.left, chartArea.top,
                        chartArea.right - chartArea.left, chartArea.bottom - chartArea.top
                    );
                    ctx.clip();

                    if (typeof el.startAngle === "number") {
                        that.brilharFatia(ctx, el, dataset, ativo.index);
                    } else if (typeof el.width === "number" && typeof el.base === "number") {
                        that.brilharBarra(ctx, el, dataset);
                    }

                    ctx.restore();
                });
            }
        });
    },

    // Brilho da fatia de rosca/pizza: um único traço com sombra suave por
    // cima da própria fatia (mesma largura do anel), sem invadir o resto do
    // card. Sem blend aditivo ("lighter") e sem repintar em cima com cor
    // sólida — isso é o que criava aquela "borda" branca ao redor do anel
    // inteiro
    brilharFatia: function (ctx, el, dataset, index) {
        var cores = dataset && dataset.rhCoresBase;
        var cor = (cores && cores[index]) || "#8b5cf6";

        var raioMeio = (el.innerRadius + el.outerRadius) / 2;
        var espessura = el.outerRadius - el.innerRadius;
        var corSombra = this.temaEscuro ? cor : this.escurecerCor(cor, 0.35);

        ctx.beginPath();
        ctx.arc(el.x, el.y, raioMeio, el.startAngle, el.endAngle);
        ctx.lineWidth = espessura;
        ctx.strokeStyle = cor;
        ctx.shadowColor = corSombra;
        ctx.shadowBlur = this.temaEscuro ? 10 : 6;
        ctx.globalAlpha = this.temaEscuro ? 0.6 : 0.45;
        ctx.stroke();
    },

    // Brilho da barra: mesmo tratamento da fatia (traço com sombra por cima
    // da própria forma), mas contornando o retângulo (arredondado, seguindo
    // o "borderRadius" configurado no dataset) da barra ativa em vez do
    // anel. "getProps(..., true)" pega a geometria final (não a do quadro
    // de animação atual) — o hover não reanima a barra, mas isso evita
    // qualquer chance de pegar um frame intermediário
    brilharBarra: function (ctx, el, dataset) {
        var cor = (dataset && dataset.rhCorBase) || "#8b5cf6";
        var props = el.getProps(["x", "y", "width", "height", "base", "horizontal"], true);

        var retangulo = props.horizontal
            ? {
                left: Math.min(props.base, props.x),
                right: Math.max(props.base, props.x),
                top: props.y - props.height / 2,
                bottom: props.y + props.height / 2
            }
            : {
                left: props.x - props.width / 2,
                right: props.x + props.width / 2,
                top: Math.min(props.y, props.base),
                bottom: Math.max(props.y, props.base)
            };

        var largura = retangulo.right - retangulo.left;
        var altura = retangulo.bottom - retangulo.top;
        var raio = Math.min(dataset.borderRadius || 0, largura / 2, altura / 2);
        var corSombra = this.temaEscuro ? cor : this.escurecerCor(cor, 0.35);

        ctx.beginPath();

        if (ctx.roundRect) {
            ctx.roundRect(retangulo.left, retangulo.top, largura, altura, raio);
        } else {
            ctx.rect(retangulo.left, retangulo.top, largura, altura);
        }

        ctx.lineWidth = 3;
        ctx.strokeStyle = cor;
        ctx.shadowColor = corSombra;
        ctx.shadowBlur = this.temaEscuro ? 14 : 8;
        ctx.globalAlpha = this.temaEscuro ? 0.7 : 0.5;
        ctx.stroke();
    },

    destroy: function (key) {
        if (this.instances[key]) {
            this.instances[key].destroy();
            delete this.instances[key];
        }
    },

    // Chamado pelo RHTheme quando o usuário troca de tema. O Chart.js não
    // lê variáveis CSS sozinho, então precisamos ajustar a cor padrão do
    // texto (legendas/eixos) na mão. Os gráficos existentes são recriados
    // em seguida (via RHApp.atualizar), então pegam essa cor nova ao nascer
    aplicarTema: function (escuro) {
        this.temaEscuro = escuro;

        if (typeof Chart !== "undefined") {
            Chart.defaults.color = escuro ? "#c7c9e6" : "#374151";
        }
    },

    // Cor das linhas de grade dos eixos, sensível ao tema atual
    corGrade: function () {
        return this.temaEscuro ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9";
    },

    // Cor de texto (legendas e eixos), sensível ao tema atual. Cada gráfico
    // seta isso explicitamente na própria criação, em vez de confiar só no
    // "Chart.defaults.color" global — esse default só pega o valor certo
    // se TODO gráfico for criado depois do tema já ter sido aplicado, e
    // views carregadas sob demanda (aba clicada, gráfico recriado depois de
    // trocar tema, etc.) podem nascer antes disso, deixando o texto escuro
    // "grudado" mesmo no tema escuro — ilegível no fundo escuro
    corTexto: function () {
        return this.temaEscuro ? "#c7c9e6" : "#374151";
    },

    // generateLabels da legenda pros gráficos de rosca/pizza, usando a cor
    // "pura" de cada fatia (dataset.rhCoresBase) em vez da cor resolvida
    // pelo Chart.js. Isso importa porque a cor de verdade é um gradiente
    // radial (CanvasGradient) ancorado na posição/raio do anel — servindo
    // ela pro quadradinho da legenda (desenhado em outro lugar do canvas)
    // faz o Chart.js pintar o trecho errado do gradiente, geralmente saindo
    // quase branco
    legendaCoresPlanas: function (chart) {
        var data = chart.data;

        if (!data.labels || !data.labels.length || !data.datasets.length) {
            return [];
        }

        var cores = data.datasets[0].rhCoresBase || [];
        // RHCharts direto (não "this"): o Chart.js chama generateLabels
        // como função solta (sem o "this" de RHCharts), então "this" aqui
        // dentro não seria o objeto certo
        // Cards claros (ex.: Férias) forçam a cor da legenda via options
        var corForcada = chart.options.plugins
            && chart.options.plugins.legend
            && chart.options.plugins.legend.labels
            && chart.options.plugins.legend.labels.rhCorFixa;
        var corTexto = corForcada || RHCharts.corTexto();

        return data.labels.map(function (label, i) {
            var cor = cores[i] || "#8b5cf6";

            return {
                text: label,
                fillStyle: cor,
                strokeStyle: cor,
                // O Chart.js não usa "options.labels.color" pra pintar o
                // texto quando existe um generateLabels customizado — ele lê
                // o "fontColor" de CADA item (o generateLabels padrão sempre
                // inclui esse campo). Sem ele aqui, o fillStyle do texto
                // fica undefined (atribuição inválida no canvas, ignorada
                // silenciosamente) e o texto sai preto/com a cor que sobrou
                fontColor: corTexto,
                lineWidth: 0,
                hidden: !chart.getDataVisibility(i),
                index: i
            };
        });
    },

    // Mesma ideia, pro quadradinho de cor do tooltip
    tooltipCorPlana: function (context) {
        var dataset = context.chart.data.datasets[context.datasetIndex];
        var cores = dataset && dataset.rhCoresBase;
        var cor = (cores && cores[context.dataIndex]) || "#8b5cf6";

        return {
            backgroundColor: cor,
            borderColor: cor
        };
    },

    // Paleta padrão pra gráficos de distribuição/categoria (sem significado
    // de status). Antes era um gradiente contínuo roxo -> ciano — com
    // poucas fatias dava pra espalhar bem, mas com 5+ fatias (todo o
    // gráfico usa os 7 tons) fatias vizinhas ficavam quase idênticas, dando
    // a impressão de que as cores estavam "misturadas". Essas cores agora
    // alternam entre tons quentes e frios (mantendo o roxo/ciano da marca
    // nas duas primeiras posições), então mesmo entradas vizinhas do array
    // ficam bem distintas entre si — não é mais um espectro contínuo
    PALETA_CATEGORICA: ["#a855f7", "#f97316", "#06b6d4", "#ec4899", "#22c55e", "#6366f1", "#eab308", "#ef4444"],

    // Espalha as cores por todo o espectro da paleta conforme a quantidade
    // de fatias, em vez de sempre pegar as primeiras (que ficam parecidas
    // demais quando o gráfico tem poucas categorias)
    coresCategoricas: function (quantidade) {
        var paleta = this.PALETA_CATEGORICA;

        if (quantidade <= 1) {
            return [paleta[0]];
        }

        var cores = [];

        for (var i = 0; i < quantidade; i++) {
            var indice = Math.round((i * (paleta.length - 1)) / (quantidade - 1));
            cores.push(paleta[indice]);
        }

        return cores;
    },

    // Cria um preenchimento em gradiente pra barras (scriptable option do
    // Chart.js). Enquanto o gráfico ainda não tem área calculada, devolve
    // uma cor sólida de fallback pra não quebrar a primeira renderização
    gradienteBarra: function (corInicio, corFim, horizontal) {
        this.registrarPluginBrilho();

        return function (context) {
            var chart = context.chart;
            var chartArea = chart.chartArea;

            if (!chartArea) {
                return corInicio;
            }

            var gradiente = horizontal
                ? chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
                : chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);

            gradiente.addColorStop(0, corInicio);
            gradiente.addColorStop(1, corFim);

            return gradiente;
        };
    },

    // Clareia uma cor hex misturando com branco na proporção "fator"
    // (0 = cor original, 1 = branco). Usado pra gerar o brilho dos
    // gradientes radiais das fatias de rosca/pizza
    clarearCor: function (hex, fator) {
        var num = parseInt(hex.replace("#", ""), 16);
        var r = (num >> 16) & 255;
        var g = (num >> 8) & 255;
        var b = num & 255;

        r = Math.round(r + (255 - r) * fator);
        g = Math.round(g + (255 - g) * fator);
        b = Math.round(b + (255 - b) * fator);

        return "rgb(" + r + ", " + g + ", " + b + ")";
    },

    // Escurece uma cor hex misturando com preto na proporção "fator".
    // Usado pra dar profundidade na borda externa das fatias
    escurecerCor: function (hex, fator) {
        var num = parseInt(hex.replace("#", ""), 16);
        var r = (num >> 16) & 255;
        var g = (num >> 8) & 255;
        var b = num & 255;

        r = Math.round(r * (1 - fator));
        g = Math.round(g * (1 - fator));
        b = Math.round(b * (1 - fator));

        return "rgb(" + r + ", " + g + ", " + b + ")";
    },

    // Transforma uma lista de cores planas em UM gradiente radial "glossy"
    // por fatia. O gradiente é concêntrico ao próprio anel (não ao círculo
    // cheio) indo da borda interna — bem clara/brilhante — até a borda
    // externa — na cor cheia, levemente escurecida pra dar profundidade.
    // Isso é o que faz o brilho realmente aparecer: um gradiente
    // centralizado no meio do donut fica escondido dentro do buraco, já
    // que só a faixa do anel é desenhada. "brilhoExtra" (0-0.2) intensifica
    // tudo, usado no hover pra a fatia "acender". Precisa ser uma única
    // function (não um array de functions): é assim que o Chart.js resolve
    // "scriptable options" — ela mesma usa context.dataIndex pra escolher
    // a cor base de cada fatia
    gradienteRadialFatias: function (coresBase, brilhoExtra) {
        var that = this;
        brilhoExtra = brilhoExtra || 0;

        this.registrarPluginBrilho();

        return function (context) {
            var cor = coresBase[context.dataIndex] || coresBase[0];
            var chart = context.chart;
            var chartArea = chart.chartArea;

            if (!chartArea) {
                return cor;
            }

            var centroX = (chartArea.left + chartArea.right) / 2;
            var centroY = (chartArea.top + chartArea.bottom) / 2;
            var raio = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;

            // 0.68 acompanha o "cutout" configurado nos gráficos de rosca
            var raioInterno = raio * 0.68;

            // O brilho ("0" abaixo) começa quase em cima do raio interno
            // real do anel (0.94, não 0.75) — assim ele fica concentrado
            // numa faixa fina perto do buraco, tipo um reflexo de luz na
            // borda, em vez de tomar conta de metade da fatia visível
            var gradiente = chart.ctx.createRadialGradient(
                centroX, centroY, raioInterno * 0.94,
                centroX, centroY, raio * 1.05
            );

            // No tema claro o cartão de fundo já é quase branco, então o
            // brilho "quase branco" do tema escuro some dentro do fundo em
            // vez de parecer glossy — usa um brilho bem mais discreto e uma
            // sombra mais escura, pra fatia continuar destacada do cartão
            //
            // No tema escuro, misturar tanto com branco (e numa faixa larga
            // da fatia) apagava a diferença entre fatias vizinhas em
            // paletas de tons próximos (roxo/azul/ciano da PALETA_CATEGORICA)
            // — todas ficavam com a mesma lavanda clara. Combinado com o
            // raio interno mais justo acima, esses fatores mantêm o brilho
            // glossy como um reflexo fino, sem lavar a cor da fatia inteira
            if (that.temaEscuro) {
                gradiente.addColorStop(0, that.clarearCor(cor, 0.65 + brilhoExtra * 0.3));
                gradiente.addColorStop(0.5, that.clarearCor(cor, 0.12 + brilhoExtra));
                gradiente.addColorStop(1, that.escurecerCor(cor, brilhoExtra ? 0.04 : 0.2));
            } else {
                gradiente.addColorStop(0, that.clarearCor(cor, 0.35 + brilhoExtra * 0.35));
                gradiente.addColorStop(0.5, cor);
                gradiente.addColorStop(1, that.escurecerCor(cor, brilhoExtra ? 0.1 : 0.25));
            }

            return gradiente;
        };
    },

    renderOverview: function (instanceId, dados) {
        this.renderMovimentacao(instanceId, dados.movimentacao);
        this.renderDistribuicao(instanceId, dados.distribuicao);
    },

    renderMovimentacao: function (instanceId, dados) {
        var key = "movimentacao_" + instanceId;
        var canvas = document.getElementById("rhChartMovimentacao_" + instanceId);

        if (!canvas) {
            return;
        }

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [
                    {
                        label: "Admissões",
                        data: dados.admissoes,
                        rhCorBase: "#16a34a",
                        backgroundColor: this.gradienteBarra("#16a34a", "#4ade80", false),
                        borderRadius: 6
                    },
                    {
                        label: "Rescisões",
                        data: dados.rescisoes,
                        rhCorBase: "#dc2626",
                        backgroundColor: this.gradienteBarra("#dc2626", "#fb923c", false),
                        borderRadius: 6
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569"
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    x: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderDistribuicao: function (instanceId, dados) {
        var key = "distribuicao_" + instanceId;
        var canvas = document.getElementById("rhChartDistribuicao_" + instanceId);

        if (!canvas) {
            return;
        }

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [
                    {
                        data: dados.valores,
                        rhCoresBase: this.coresCategoricas(dados.valores.length),
                        backgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                        hoverBackgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                        borderWidth: 0,
                        hoverOffset: 6
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Colaboradores", dica: "" })
                    }
                }
            }
        });
    },

    renderAdmission: function (instanceId, dados) {
        this.renderAdmissionMes(instanceId, dados.porMes);
        this.renderAdmissionTipo(instanceId, dados.porTipo);
    },

    renderAdmissionMes: function (instanceId, dados) {
        var key = "admissionMes_" + instanceId;
        var canvas = document.getElementById("rhAdmissionChartMes_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Admissões",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", false),
                    borderRadius: 5
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569"
                        }
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        }
                    },

                    x: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderAdmissionTipo: function (instanceId, dados) {
        var key = "admissionTipo_" + instanceId;
        var canvas = document.getElementById("rhAdmissionChartTipo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: this.coresCategoricas(dados.valores.length),
                    backgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    hoverBackgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Admissões", dica: "" })
                    }
                }
            }
        });
    },

    renderVacation: function (instanceId, dados) {
        this.renderVacationSecao(instanceId, dados.secao);
        this.renderVacationSituacao(instanceId, dados.situacao);
    },

    renderVacationSecao: function (instanceId, dados) {
        var key = "vacationSecao_" + instanceId;
        var canvas = document.getElementById("rhVacationChartSecao_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Saldo (dias)",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", true),
                    borderRadius: 5
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: this.corTexto(),
                            precision: 0
                        },
                        grid: {
                            color: this.corGrade()
                        }
                    },

                    y: {
                        ticks: {
                            color: this.corTexto()
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderVacationSituacao: function (instanceId, dados) {
        var key = "vacationSituacao_" + instanceId;
        var canvas = document.getElementById("rhVacationChartSituacao_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: this.coresCategoricas(dados.valores.length),
                    backgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    hoverBackgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                radius: "82%",

                onHover: function (evento, ativos) {
                    evento.native.target.style.cursor =
                        ativos.length && dados.onClick ? "pointer" : "default";
                },

                onClick: function (evento, ativos) {
                    if (!ativos.length || !dados.onClick) return;

                    dados.onClick(dados.labels[ativos[0].index]);
                },

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId)
                    }
                }
            }
        });
    },

    // Clique/hover de rosca: só ativa quando a view passa dados.onClick(label)
    roscaHover: function (dados) {
        return function (evento, ativos) {
            evento.native.target.style.cursor =
                ativos.length && dados.onClick ? "pointer" : "default";
        };
    },

    roscaClick: function (dados) {
        return function (evento, ativos) {
            if (!ativos.length || !dados.onClick) return;

            dados.onClick(dados.labels[ativos[0].index]);
        };
    },

    // Clique/hover de barra: só ativa quando a view passa dados.onClick(label)
    barraHover: function (dados) {
        return function (evento, ativos) {
            evento.native.target.style.cursor =
                ativos.length && dados.onClick ? "pointer" : "default";
        };
    },

    barraClick: function (dados) {
        return function (evento, ativos) {
            if (!ativos.length || !dados.onClick) return;

            dados.onClick(dados.labels[ativos[0].index], ativos[0].datasetIndex);
        };
    },

    // Tooltip HTML em card branco para gráficos de barra (mesmo visual da aba Férias)
    tooltipCardBarra: function (dados) {
        var escapar = function (txt) {
            return $("<div>").text(txt).html();
        };

        return function (context) {
            var chart = context.chart;
            var tooltip = context.tooltip;
            var pai = chart.canvas.parentNode;
            var el = pai.querySelector(".rh-card-tooltip");

            if (!el) {
                el = document.createElement("div");
                el.className = "rh-card-tooltip";
                el.style.cssText =
                    "position:absolute;pointer-events:none;z-index:50;" +
                    "background:#fff;border:1px solid #e2e8f0;" +
                    "border-radius:14px;padding:14px;font-size:12px;" +
                    "color:#334155;box-shadow:0 12px 36px rgba(15,23,42,.12);" +
                    "transition:opacity .12s ease;white-space:nowrap;";
                pai.style.position = "relative";
                pai.appendChild(el);
            }

            if (tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
                el.style.opacity = 0;
                return;
            }

            var titulo = (tooltip.title && tooltip.title[0]) || "";

            var linhas = tooltip.dataPoints.map(function (ponto) {
                var cor = ponto.dataset.rhCorBase || "#6366f1";

                return '<div style="display:flex;justify-content:space-between;gap:24px;margin-bottom:7px;">' +
                    '<span style="color:#64748b;">' +
                    '<span style="display:inline-block;width:7px;height:7px;margin-right:7px;' +
                    'border-radius:50%;background:' + cor + ';"></span>' +
                    escapar(ponto.dataset.label || "") + '</span>' +
                    '<strong style="color:#0f172a;">' + escapar(
                        dados && dados.formatar ? dados.formatar(ponto.raw) : ponto.formattedValue
                    ) + '</strong></div>';
            }).join("");

            el.innerHTML =
                '<div style="min-width:180px">' +
                '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px;">' +
                escapar(titulo) + '</div>' + linhas +
                (dados && dados.onClick
                    ? '<div style="margin-top:3px;padding-top:9px;border-top:1px solid #f1f5f9;' +
                    'color:#6366f1;font-size:10px;font-weight:700;">Clique para detalhar</div>'
                    : '') +
                '</div>';

            var x = tooltip.caretX + 14;
            var y = tooltip.caretY - el.offsetHeight / 2;

            if (x + el.offsetWidth > pai.clientWidth) {
                x = tooltip.caretX - el.offsetWidth - 14;
            }

            x = Math.max(0, x);
            y = Math.max(0, Math.min(y, pai.clientHeight - el.offsetHeight));

            el.style.left = x + "px";
            el.style.top = y + "px";
            el.style.opacity = 1;
        };
    },

    // Tooltip HTML em card branco (mesmo visual do gráfico Saldo x Dias Gozados)
    tooltipCardFerias: function (instanceId, opcoes) {
        opcoes = opcoes || {};
        var escapar = function (txt) {
            return $("<div>").text(txt).html();
        };
        // Por padrão mostra o número cru (contagens); gráficos de valores
        // passam "formatar" pra exibir em R$
        var formatar = opcoes.formatar || function (numero) {
            return numero;
        };

        return function (context) {
            var chart = context.chart;
            var tooltip = context.tooltip;
            var el = chart.canvas.parentNode.querySelector(".rh-card-tooltip");

            if (!el) {
                el = document.createElement("div");
                el.className = "rh-card-tooltip";
                el.style.cssText =
                    "position:absolute;pointer-events:none;z-index:50;" +
                    "background:#fff;border:1px solid #e2e8f0;" +
                    "border-radius:14px;padding:14px;font-size:12px;" +
                    "color:#334155;box-shadow:0 12px 36px rgba(15,23,42,.12);" +
                    "transition:opacity .12s ease;white-space:nowrap;";
                chart.canvas.parentNode.style.position = "relative";
                chart.canvas.parentNode.appendChild(el);
            }

            if (tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) {
                el.style.opacity = 0;
                return;
            }

            var ponto = tooltip.dataPoints[0];
            var dataset = ponto.dataset;
            var total = dataset.data.reduce(function (a, b) {
                return a + (Number(b) || 0);
            }, 0);
            var valor = Number(ponto.raw) || 0;
            var pct = total ? (valor / total * 100).toFixed(1) : "0.0";
            var cor = (dataset.rhCoresBase && dataset.rhCoresBase[ponto.dataIndex]) || "#6366f1";

            var linha = function (rotulo, val, dot, ultima) {
                return '<div style="display:flex;justify-content:space-between;gap:24px;' +
                    (ultima ? '' : 'margin-bottom:7px;') + '">' +
                    '<span style="color:#64748b;">' +
                    (dot ? '<span style="display:inline-block;width:7px;height:7px;' +
                        'margin-right:7px;border-radius:50%;background:' + dot + ';"></span>' : '') +
                    rotulo + '</span>' +
                    '<strong style="color:#0f172a;">' + val + '</strong></div>';
            };

            el.innerHTML =
                '<div style="min-width:190px">' +
                '<div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:10px;">' +
                escapar(ponto.label) + '</div>' +
                linha(opcoes.rotulo || "Férias", formatar(valor), cor) +
                linha("Participação", pct.replace(".", ",") + "%") +
                linha("Total geral", formatar(total), null, true) +
                (opcoes.dica === ""
                    ? ''
                    : '<div style="margin-top:10px;padding-top:9px;border-top:1px solid #f1f5f9;' +
                    'color:#6366f1;font-size:10px;font-weight:700;">' +
                    (opcoes.dica || 'Clique para ver os colaboradores') + '</div>') +
                '</div>';

            var pai = chart.canvas.parentNode;
            var x = tooltip.caretX + 14;
            var y = tooltip.caretY - el.offsetHeight / 2;

            if (x + el.offsetWidth > pai.clientWidth) {
                x = tooltip.caretX - el.offsetWidth - 14;
            }
            x = Math.max(0, x);
            y = Math.max(0, Math.min(y, pai.clientHeight - el.offsetHeight));

            el.style.left = x + "px";
            el.style.top = y + "px";
            el.style.opacity = 1;
        };
    },

    renderContract: function (instanceId, dados) {
        this.renderContractStatus(instanceId, dados.status);
        this.renderContractTipo(instanceId, dados.tipo);
    },

    renderContractStatus: function (instanceId, dados) {
        var key = "contractStatus_" + instanceId;
        var canvas = document.getElementById("rhContractChartStatus_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: ["#16a34a", "#ea580c", "#dc2626", "#7c3aed"],
                    backgroundColor: this.gradienteRadialFatias([
                        "#16a34a",
                        "#ea580c",
                        "#dc2626",
                        "#7c3aed"
                    ]),
                    hoverBackgroundColor: this.gradienteRadialFatias([
                        "#16a34a",
                        "#ea580c",
                        "#dc2626",
                        "#7c3aed"
                    ]),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Contratos", dica: "" })
                    }
                }
            }
        });
    },

    renderContractTipo: function (instanceId, dados) {
        var key = "contractTipo_" + instanceId;
        var canvas = document.getElementById("rhContractChartTipo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Contratos",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", false),
                    borderRadius: 5
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    x: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderQuota: function (instanceId, dados) {
        this.renderQuotaStatus(instanceId, "rhQuotaChartPcdStatus_", "quotaPcdStatus_", dados.statusPcd);
        this.renderQuotaStatus(instanceId, "rhQuotaChartAprendizStatus_", "quotaAprendizStatus_", dados.statusAprendiz);
        this.renderQuotaRanking(instanceId, dados.ranking);
    },

    renderQuotaStatus: function (instanceId, canvasPrefix, keyPrefix, dados) {
        var key = keyPrefix + instanceId;
        var canvas = document.getElementById(canvasPrefix + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: ["#16a34a", "#ea580c", "#dc2626", "#94a3b8"],
                    backgroundColor: this.gradienteRadialFatias([
                        "#16a34a",
                        "#ea580c",
                        "#dc2626",
                        "#94a3b8"
                    ]),
                    hoverBackgroundColor: this.gradienteRadialFatias([
                        "#16a34a",
                        "#ea580c",
                        "#dc2626",
                        "#94a3b8"
                    ]),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Colaboradores", dica: "" })
                    }
                }
            }
        });
    },

    renderQuotaRanking: function (instanceId, dados) {
        var key = "quotaRanking_" + instanceId;
        var canvas = document.getElementById("rhQuotaChartRanking_" + instanceId);

        if (!canvas) return;

        this.destroy(key);
        this.registrarPluginBrilho();

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Déficit",
                    data: dados.valores,
                    rhCorBase: "#dc2626",
                    backgroundColor: "#dc2626",
                    borderRadius: 5
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderLeave: function (instanceId, dados) {
        this.renderLeaveTipo(instanceId, dados.tipo);
        this.renderLeaveDuracao(instanceId, dados.duracao);
        this.renderLeaveRanking(instanceId, dados.ranking);
    },

    renderLeaveTipo: function (instanceId, dados) {
        var key = "leaveTipo_" + instanceId;
        var canvas = document.getElementById("rhLeaveChartTipo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: this.coresCategoricas(dados.valores.length),
                    backgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    hoverBackgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Afastamentos", dica: "" })
                    }
                }
            }
        });
    },

    renderLeaveDuracao: function (instanceId, dados) {
        var key = "leaveDuracao_" + instanceId;
        var canvas = document.getElementById("rhLeaveChartDuracao_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Afastamentos",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", false),
                    borderRadius: 5
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    x: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderLeaveRanking: function (instanceId, dados) {
        var key = "leaveRanking_" + instanceId;
        var canvas = document.getElementById("rhLeaveChartRanking_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Dias perdidos",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", true),
                    borderRadius: 5
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderTermination: function (instanceId, dados) {
        this.renderTerminationMes(instanceId, dados.mes);
        this.renderTerminationMotivo(instanceId, dados.motivo);
        this.renderTerminationFaixaTempo(instanceId, dados.faixaTempo);
    },

    renderTerminationMes: function (instanceId, dados) {
        var key = "terminationMes_" + instanceId;
        var canvas = document.getElementById("rhTerminationChartMes_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Rescisões",
                    data: dados.valores,
                    rhCorBase: "#dc2626",
                    backgroundColor: this.gradienteBarra("#dc2626", "#fb923c", false),
                    borderRadius: 5
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    x: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    renderTerminationMotivo: function (instanceId, dados) {
        var key = "terminationMotivo_" + instanceId;
        var canvas = document.getElementById("rhTerminationChartMotivo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: this.coresCategoricas(dados.valores.length),
                    backgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    hoverBackgroundColor: this.gradienteRadialFatias(this.coresCategoricas(dados.valores.length)),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, { rotulo: "Rescisões", dica: "" })
                    }
                }
            }
        });
    },

    renderTerminationFaixaTempo: function (instanceId, dados) {
        var key = "terminationFaixaTempo_" + instanceId;
        var canvas = document.getElementById("rhTerminationChartFaixaTempo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: "Rescisões",
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", true),
                    borderRadius: 5
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra(dados)
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            precision: 0
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#475569"
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    // =========================
    // Benefícios
    // =========================

    formatarMoeda: function (valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    // Rótulo curto pro eixo de valores: "R$ 1,2 mi", "R$ 350 mil", "R$ 900"
    moedaCompacta: function (valor) {
        var numero = Number(valor) || 0;
        var absoluto = Math.abs(numero);

        if (absoluto >= 1000000) {
            return "R$ " + (numero / 1000000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
        }

        if (absoluto >= 1000) {
            return "R$ " + (numero / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil";
        }

        return "R$ " + numero.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
    },

    renderBenefit: function (instanceId, dados) {
        this.renderBenefitMes(instanceId, dados.mes);
        this.renderBenefitGrupo(instanceId, dados.grupo);

        this.renderBenefitRanking(instanceId, "benefitBeneficio_", "rhBenefitChartBeneficio_", dados.beneficio, {
            rotulo: "Custo",
            dinheiro: true
        });

        this.renderBenefitRanking(instanceId, "benefitColaboradores_", "rhBenefitChartColaboradores_", dados.colaboradores, {
            rotulo: "Colaboradores",
            dinheiro: false
        });

        this.renderBenefitRanking(instanceId, "benefitFilial_", "rhBenefitChartFilial_", dados.filial, {
            rotulo: "Custo",
            dinheiro: true
        });

        this.renderBenefitRanking(instanceId, "benefitSecao_", "rhBenefitChartSecao_", dados.secao, {
            rotulo: "Custo",
            dinheiro: true
        });
    },

    // Barras empilhadas por competência (empresa x colaborador x outros)
    renderBenefitMes: function (instanceId, dados) {
        var key = "benefitMes_" + instanceId;
        var canvas = document.getElementById("rhBenefitChartMes_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: dados.series.map(function (serie) {
                    return {
                        label: serie.label,
                        data: serie.valores,
                        rhCorBase: serie.cor,
                        backgroundColor: serie.cor,
                        borderRadius: 3
                    };
                })
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra({
                            onClick: dados.onClick,
                            formatar: RHCharts.formatarMoeda
                        })
                    },
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569"
                        }
                    }
                },

                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: "#475569",
                            maxRotation: 0
                        },
                        grid: {
                            display: false
                        }
                    },

                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            color: "#475569",
                            callback: function (valor) {
                                return RHCharts.moedaCompacta(valor);
                            }
                        },
                        grid: {
                            color: "#e2e8f0"
                        }
                    }
                }
            }
        });
    },

    renderBenefitGrupo: function (instanceId, dados) {
        var key = "benefitGrupo_" + instanceId;
        var canvas = document.getElementById("rhBenefitChartGrupo_" + instanceId);

        if (!canvas) return;

        this.destroy(key);

        // Sem lançamento no recorte não há fatia nem cor; o gradiente das
        // fatias exige ao menos uma cor base (senão quebra e deixa o canvas
        // "preso" a um gráfico pela metade)
        var cores = dados.cores.length ? dados.cores : ["#cbd5e1"];

        this.instances[key] = new Chart(canvas, {
            type: "doughnut",

            data: {
                labels: dados.labels,

                datasets: [{
                    data: dados.valores,
                    rhCoresBase: cores,
                    backgroundColor: this.gradienteRadialFatias(cores),
                    hoverBackgroundColor: this.gradienteRadialFatias(cores),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "68%",
                onHover: RHCharts.roscaHover(dados),
                onClick: RHCharts.roscaClick(dados),
                radius: "82%",

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#475569",
                            rhCorFixa: "#475569",
                            generateLabels: this.legendaCoresPlanas
                        }
                    },
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardFerias(instanceId, {
                            rotulo: "Valor",
                            formatar: RHCharts.formatarMoeda
                        })
                    }
                }
            }
        });
    },

    // Ranking em barras horizontais (por benefício, filial, seção...).
    // "dinheiro" troca o formato do eixo e do tooltip de contagem pra R$
    renderBenefitRanking: function (instanceId, chavePrefixo, canvasPrefixo, dados, opcoes) {
        var key = chavePrefixo + instanceId;
        var canvas = document.getElementById(canvasPrefixo + instanceId);

        if (!canvas) return;

        this.destroy(key);

        // maxRotation 0: rótulos na horizontal; se não couberem, o Chart.js
        // pula alguns em vez de inclinar
        var eixoValores = opcoes.dinheiro
            ? {
                color: "#475569",
                maxRotation: 0,
                callback: function (valor) {
                    return RHCharts.moedaCompacta(valor);
                }
            }
            : {
                color: "#475569",
                maxRotation: 0,
                precision: 0
            };

        this.instances[key] = new Chart(canvas, {
            type: "bar",

            data: {
                labels: dados.labels,

                datasets: [{
                    label: opcoes.rotulo,
                    data: dados.valores,
                    rhCorBase: "#8b5cf6",
                    backgroundColor: this.gradienteBarra("#8b5cf6", "#06b6d4", true),
                    borderRadius: 5
                }]
            },

            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                onHover: RHCharts.barraHover(dados),
                onClick: RHCharts.barraClick(dados),

                plugins: {
                    tooltip: {
                        enabled: false,
                        external: this.tooltipCardBarra({
                            onClick: dados.onClick,
                            formatar: opcoes.dinheiro ? RHCharts.formatarMoeda : null
                        })
                    },
                    legend: {
                        display: false
                    }
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: eixoValores,
                        grid: {
                            color: "#e2e8f0"
                        }
                    },

                    y: {
                        ticks: {
                            color: "#475569",
                            // Nomes longos (filiais, seções) são cortados só no
                            // eixo; o tooltip e o clique usam o nome completo.
                            // O Chart.js limita o eixo vertical a ~40% da
                            // largura do gráfico e corta o início do texto que
                            // passa disso, então o tamanho máximo acompanha a
                            // largura do card (~7,5px por caractere)
                            callback: function (valor) {
                                var rotulo = String(this.getLabelForValue(valor));
                                var maximo = Math.max(12, Math.floor((this.chart.width * 0.36) / 7.5));

                                return rotulo.length > maximo ? rotulo.slice(0, maximo - 1) + "…" : rotulo;
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

};
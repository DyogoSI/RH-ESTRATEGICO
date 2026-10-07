var RHBenefitService = {

    // Sem período escolhido, o painel mostra só as últimas N competências —
    // o CSV vai de 2001 até hoje, e somar 25 anos num KPI não ajuda ninguém
    MESES_JANELA_PADRAO: 12,

    // Variação mês a mês a partir da qual a linha da tabela ganha destaque
    VARIACAO_RELEVANTE_PCT: 10,

    GRUPOS: {
        empresa: "Custeado pela empresa",
        colaborador: "Descontado dos colaboradores",
        outros: "Outros eventos"
    },

    // Catálogo dos eventos de benefício (uma coluna do CSV cada).
    //  - grupo: quem arca com o valor. "empresa" = custo da empresa;
    //    "colaborador" = desconto em folha (inclui co-participações)
    //  - papel: "titular" / "dependente" quando o evento é de plano de saúde
    //    ou odontológico, pra contar quem tem titular e quem tem dependente
    // A classificação em empresa x colaborador segue o nome dos eventos da
    // folha (…EMPRESA, CUSTO…EMPRESA, COMPRA…, TICKET… = empresa; DESCONTO…,
    // COPART…, assistência médica/odontológica e dependentes = colaborador).
    // Se algum evento estiver no grupo errado, é só trocar aqui.
    BENEFICIOS: [
        { campo: "PLANO_SAUDE_SULAMERICA_EMPRESA", rotulo: "Plano de Saúde SulAmérica (empresa)", grupo: "empresa", papel: null },
        { campo: "CUSTO_VALE_TRANSPORTE_EMPRESA", rotulo: "Vale-Transporte (custo empresa)", grupo: "empresa", papel: null },
        { campo: "COMPRA_VALE_ALIMENTACAO", rotulo: "Compra de Vale-Alimentação", grupo: "empresa", papel: null },
        { campo: "VALOR_TICKET_OBRA_CIVIL", rotulo: "Ticket Obra Civil", grupo: "empresa", papel: null },
        { campo: "DESCONTO_VALE_TRANSPORTE", rotulo: "Desconto Vale-Transporte", grupo: "colaborador", papel: null },
        { campo: "ASSISTENCIA_MEDICA_SULAMERICA", rotulo: "Assist. Médica SulAmérica (titular)", grupo: "colaborador", papel: "titular" },
        { campo: "DEPENDENTE_SULAMERICA", rotulo: "Assist. Médica SulAmérica (dependente)", grupo: "colaborador", papel: "dependente" },
        { campo: "ASSISTENCIA_MEDICA_UNIMED", rotulo: "Unimed (titular)", grupo: "colaborador", papel: "titular" },
        { campo: "DEPENDENTE_UNIMED", rotulo: "Unimed (dependente)", grupo: "colaborador", papel: "dependente" },
        { campo: "ASSISTENCIA_ODONTOLOGICA", rotulo: "Assist. Odontológica (titular)", grupo: "colaborador", papel: "titular" },
        { campo: "DEPENDENTE_ODONTOLOGICO", rotulo: "Odontológico (dependente)", grupo: "colaborador", papel: "dependente" },
        { campo: "COPART_AMIL", rotulo: "Co-participação Amil", grupo: "colaborador", papel: null },
        { campo: "COPART_UNIMED", rotulo: "Co-participação Unimed", grupo: "colaborador", papel: null },
        { campo: "AO_SULAMERICA", rotulo: "AO SulAmérica", grupo: "colaborador", papel: null },
        { campo: "VALE_ALIMENTACAO", rotulo: "Vale-Alimentação (desconto)", grupo: "colaborador", papel: null }
    ],

    buscar: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint("CODCOLIGADA", filtros.empresa)
            );
        }

        if (filtros.filial) {
            constraints.push(
                RHDatasetService.criarConstraint("CODFILIAL", filtros.filial)
            );
        }

        var registros = RHDatasetService.buscar("ds_rh_beneficios", constraints);
        var janela = this.janelaPeriodo(registros, filtros);

        if (!janela.inicio) {
            return { registros: [], janela: janela };
        }

        // "ANO_MES" é "AAAA-MM", então comparar como texto já ordena certo
        var noPeriodo = registros.filter(function (item) {
            return item.ANO_MES >= janela.inicio && item.ANO_MES <= janela.fim;
        });

        return { registros: this.prepararRegistros(noPeriodo), janela: janela };
    },

    // O filtro de período é por competência (mês inteiro), não por dia.
    // Sem nenhum limite escolhido, usa as 12 competências até o último mês
    // fechado que tem lançamento no recorte (empresa/filial): o mês corrente
    // fica de fora porque a folha dele ainda está abrindo (hoje o CSV tem só
    // alguns lançamentos de outubro) e distorceria totais e variações.
    // Escolhendo o período, vale exatamente o que foi escolhido
    janelaPeriodo: function (registros, filtros) {
        var presentes = {};

        registros.forEach(function (item) {
            if (item.ANO_MES) {
                presentes[item.ANO_MES] = true;
            }
        });

        var meses = Object.keys(presentes).sort();

        if (!meses.length) {
            return { inicio: null, fim: null, padrao: true };
        }

        var atual = this.anoMesAtual();

        var fechados = meses.filter(function (mes) {
            return mes < atual;
        });

        var ultimoFechado = fechados.length
            ? fechados[fechados.length - 1]
            : meses[meses.length - 1];

        // O <input type="date"> manda "AAAA-MM-DD"; o mês são os 7 primeiros
        // caracteres (evita new Date(), que desloca o dia por causa do fuso)
        var anoMesInicio = filtros.dataInicio ? String(filtros.dataInicio).slice(0, 7) : null;
        var anoMesFim = filtros.dataFim ? String(filtros.dataFim).slice(0, 7) : null;

        var fim = anoMesFim || ultimoFechado;

        if (!anoMesFim && anoMesInicio && anoMesInicio > fim) {
            fim = meses[meses.length - 1];
        }

        var inicio = anoMesInicio || this.somarMeses(fim, -(this.MESES_JANELA_PADRAO - 1));

        if (inicio > fim) {
            var troca = inicio;
            inicio = fim;
            fim = troca;
        }

        return {
            inicio: inicio,
            fim: fim,
            padrao: !anoMesInicio && !anoMesFim
        };
    },

    anoMesAtual: function () {
        var hoje = new Date();

        return hoje.getFullYear() + "-" + this.pad2(hoje.getMonth() + 1);
    },

    pad2: function (numero) {
        return numero < 10 ? "0" + numero : String(numero);
    },

    somarMeses: function (anoMes, delta) {
        var partes = String(anoMes).split("-");
        var data = new Date(Number(partes[0]), Number(partes[1]) - 1 + delta, 1);

        return data.getFullYear() + "-" + this.pad2(data.getMonth() + 1);
    },

    // "2026-09" -> "09/2026"
    formatarAnoMes: function (anoMes) {
        var partes = String(anoMes).split("-");

        return partes.length === 2 ? partes[1] + "/" + partes[0] : String(anoMes);
    },

    parseNumero: function (valor) {
        if (!valor) {
            return 0;
        }

        return Number(String(valor).replace(",", ".")) || 0;
    },

    // Converte uma vez só os valores de cada linha (e já separa o que é da
    // empresa, do colaborador e o que sobra), pra os gráficos e KPIs não
    // reprocessarem texto dezenas de vezes sobre ~20 mil linhas.
    // TOTAL_BENEFICIOS é o consolidado oficial; em ~1% das linhas ele traz
    // eventos que não têm coluna própria no CSV — essa diferença vira
    // "Outros eventos", pra empresa + colaborador + outros fechar com o total
    prepararRegistros: function (registros) {
        var that = this;
        var beneficios = this.BENEFICIOS;

        registros.forEach(function (item) {
            var valores = new Array(beneficios.length);
            var empresa = 0;
            var colaborador = 0;
            var titular = false;
            var dependente = false;

            for (var i = 0; i < beneficios.length; i++) {
                var valor = that.parseNumero(item[beneficios[i].campo]);

                valores[i] = valor;

                if (beneficios[i].grupo === "empresa") {
                    empresa += valor;
                } else {
                    colaborador += valor;
                }

                if (valor > 0) {
                    if (beneficios[i].papel === "titular") {
                        titular = true;
                    } else if (beneficios[i].papel === "dependente") {
                        dependente = true;
                    }
                }
            }

            var total = that.parseNumero(item.TOTAL_BENEFICIOS);

            item._valores = valores;
            item._total = total;
            item._empresa = empresa;
            item._colaborador = colaborador;
            item._outros = Math.max(0, total - empresa - colaborador);
            item._titular = titular;
            item._dependente = dependente;
            item._chave = item.CODCOLIGADA + "|" + item.CHAPA;
        });

        return registros;
    },

    calcularResumo: function (registros) {
        var total = 0;
        var empresa = 0;
        var colaborador = 0;
        var outros = 0;

        var colaboradores = {};
        var titulares = {};
        var comDependentes = {};
        var colaboradorMeses = {};

        registros.forEach(function (item) {
            total += item._total;
            empresa += item._empresa;
            colaborador += item._colaborador;
            outros += item._outros;

            if (item._total > 0) {
                colaboradores[item._chave] = true;
                colaboradorMeses[item._chave + "|" + item.ANO_MES] = true;
            }

            if (item._titular) {
                titulares[item._chave] = true;
            }

            if (item._dependente) {
                comDependentes[item._chave] = true;
            }
        });

        var quantidadeColaboradorMes = Object.keys(colaboradorMeses).length;

        return {
            total: total,
            empresa: empresa,
            colaborador: colaborador,
            outros: outros,
            colaboradores: Object.keys(colaboradores).length,
            titulares: Object.keys(titulares).length,
            comDependentes: Object.keys(comDependentes).length,
            mediaPorColaboradorMes: quantidadeColaboradorMes > 0
                ? total / quantidadeColaboradorMes
                : 0
        };
    },

    // Competências em ordem cronológica, com o total de cada uma
    agruparPorMes: function (registros) {
        var meses = {};

        registros.forEach(function (item) {
            var mes = meses[item.ANO_MES];

            if (!mes) {
                mes = meses[item.ANO_MES] = {
                    anoMes: item.ANO_MES,
                    total: 0,
                    empresa: 0,
                    colaborador: 0,
                    outros: 0
                };
            }

            mes.total += item._total;
            mes.empresa += item._empresa;
            mes.colaborador += item._colaborador;
            mes.outros += item._outros;
        });

        return Object.keys(meses).sort().map(function (chave) {
            return meses[chave];
        });
    },

    // Total por filial/seção/etc., do maior pro menor
    agruparPorDimensao: function (registros, campoChave, campoLabel) {
        var grupos = {};

        registros.forEach(function (item) {
            var chave = item[campoChave] || "-";
            var grupo = grupos[chave];

            if (!grupo) {
                grupo = grupos[chave] = {
                    chave: chave,
                    label: item[campoLabel] || chave,
                    total: 0,
                    empresa: 0,
                    colaborador: 0
                };
            }

            grupo.total += item._total;
            grupo.empresa += item._empresa;
            grupo.colaborador += item._colaborador;
        });

        return Object.keys(grupos)
            .map(function (chave) {
                return grupos[chave];
            })
            .filter(function (grupo) {
                return grupo.total > 0;
            })
            .sort(function (a, b) {
                return b.total - a.total;
            });
    },

    // Uma linha por benefício com valor no período: total, quantos
    // colaboradores têm, média por colaborador e peso no total
    resumoPorBeneficio: function (registros, resumo) {
        var linhas = this.BENEFICIOS.map(function (beneficio) {
            return {
                campo: beneficio.campo,
                rotulo: beneficio.rotulo,
                grupo: beneficio.grupo,
                total: 0,
                colaboradores: {}
            };
        });

        registros.forEach(function (item) {
            for (var i = 0; i < linhas.length; i++) {
                if (item._valores[i] > 0) {
                    linhas[i].total += item._valores[i];
                    linhas[i].colaboradores[item._chave] = true;
                }
            }
        });

        var itens = linhas
            .filter(function (linha) {
                return linha.total > 0;
            })
            .map(function (linha) {
                var quantidade = Object.keys(linha.colaboradores).length;

                return {
                    campo: linha.campo,
                    rotulo: linha.rotulo,
                    grupo: linha.grupo,
                    total: linha.total,
                    colaboradores: quantidade,
                    media: quantidade > 0 ? linha.total / quantidade : 0,
                    percentual: resumo.total > 0 ? (linha.total / resumo.total) * 100 : 0
                };
            });

        if (resumo.outros > 0.005) {
            itens.push({
                campo: null,
                rotulo: "Outros eventos (não detalhados)",
                grupo: "outros",
                total: resumo.outros,
                colaboradores: null,
                media: null,
                percentual: resumo.total > 0 ? (resumo.outros / resumo.total) * 100 : 0
            });
        }

        return itens.sort(function (a, b) {
            return b.total - a.total;
        });
    },

    // Variação de cada competência contra a anterior. O mês corrente é
    // marcado "emAndamento" e fica sem percentual: a folha dele ainda não
    // fechou e a comparação seria enganosa
    variacoes: function (meses) {
        var atual = this.anoMesAtual();

        return meses.map(function (mes, i) {
            var anterior = i > 0 ? meses[i - 1] : null;
            var emAndamento = mes.anoMes === atual;
            var deltaValor = anterior ? mes.total - anterior.total : null;
            var deltaPct = anterior && anterior.total > 0
                ? (deltaValor / anterior.total) * 100
                : null;

            return {
                anoMes: mes.anoMes,
                anoMesAnterior: anterior ? anterior.anoMes : null,
                total: mes.total,
                deltaValor: emAndamento ? null : deltaValor,
                deltaPct: emAndamento ? null : deltaPct,
                emAndamento: emAndamento
            };
        });
    },

    // Última competência fechada que tem comparação com a anterior
    ultimaVariacao: function (variacoes) {
        for (var i = variacoes.length - 1; i >= 0; i--) {
            if (!variacoes[i].emAndamento && variacoes[i].deltaPct !== null) {
                return variacoes[i];
            }
        }

        return null;
    },

    // Uma linha por colaborador, somando o período. "campoFoco" (opcional) é
    // a coluna de um benefício específico, somada à parte em "foco"
    porColaborador: function (registros, campoFoco) {
        var colaboradores = {};

        registros.forEach(function (item) {
            var colaborador = colaboradores[item._chave];

            if (!colaborador) {
                colaborador = colaboradores[item._chave] = {
                    nome: item.NOME,
                    secao: "-",
                    funcao: "-",
                    filial: "-",
                    ultimoMes: "",
                    total: 0,
                    empresa: 0,
                    colaborador: 0,
                    outros: 0,
                    foco: 0,
                    meses: {}
                };
            }

            // Seção/função/filial podem mudar ao longo do tempo: vale a mais recente
            if (item.ANO_MES >= colaborador.ultimoMes) {
                colaborador.ultimoMes = item.ANO_MES;
                colaborador.secao = item.NOME_SECAO || "-";
                colaborador.funcao = item.NOME_FUNCAO || "-";
                colaborador.filial = item.NOME_FILIAL || "-";
            }

            colaborador.total += item._total;
            colaborador.empresa += item._empresa;
            colaborador.colaborador += item._colaborador;
            colaborador.outros += item._outros;

            if (campoFoco) {
                colaborador.foco += RHBenefitService.parseNumero(item[campoFoco]);
            }

            if (item._total > 0) {
                colaborador.meses[item.ANO_MES] = true;
            }
        });

        return Object.keys(colaboradores).map(function (chave) {
            var colaborador = colaboradores[chave];

            colaborador.quantidadeMeses = Object.keys(colaborador.meses).length;

            return colaborador;
        });
    }

};

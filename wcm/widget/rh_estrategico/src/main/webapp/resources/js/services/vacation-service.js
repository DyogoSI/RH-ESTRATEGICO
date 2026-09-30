var RHVacationService = {

    buscarSaldo: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint("COLIGADA", filtros.empresa)
            );
        }

        return RHDatasetService.buscar("ds_rh_ferias_saldo", constraints);
    },

    buscarMarcadas: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint("CODCOLIGADA", filtros.empresa)
            );
        }

        var registros = RHDatasetService.buscar("ds_rh_ferias_marcadas", constraints);

        return this.filtrarPeriodo(registros, filtros);
    },

    // Nem "ds_rh_ferias_saldo" nem "ds_rh_ferias_marcadas" têm coluna de
    // filial, então esses dois só filtram por empresa no server. "Marcadas"
    // tem DATAINICIO/DATAFIM, então dá pra aplicar o filtro de período aqui
    filtrarPeriodo: function (registros, filtros) {
        if (!filtros.dataInicio && !filtros.dataFim) {
            return registros;
        }

        var that = this;
        var inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        var fim = filtros.dataFim ? new Date(filtros.dataFim) : null;

        return registros.filter(function (item) {
            var dataInicioFerias = that.parseData(item.DATAINICIO);

            if (!dataInicioFerias) {
                return false;
            }

            if (inicio && dataInicioFerias < inicio) {
                return false;
            }

            if (fim && dataInicioFerias > fim) {
                return false;
            }

            return true;
        });
    },

    parseNumero: function (valor) {
        if (!valor) {
            return 0;
        }

        return Number(String(valor).replace(",", ".")) || 0;
    },

    parseData: function (valor) {
        if (!valor) {
            return null;
        }

        var partes = String(valor).split("/");

        if (partes.length !== 3) {
            return null;
        }

        var data = new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));

        return isNaN(data.getTime()) ? null : data;
    },

    obterVencimento30: function (item) {
        return item["VENCIMENTO 30 DIAS"]
            || item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"]
            || "";
    },

    calcularResumo: function (registrosSaldo, registrosMarcadas) {
        var that = this;

        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        var em30Dias = new Date(hoje.getTime());
        em30Dias.setDate(em30Dias.getDate() + 30);

        var somaSaldo = 0;
        var somaDiasGozados = 0;

        var vencendoAte7 = 0;
        var vencendo8a15 = 0;
        var vencendo16a30 = 0;

        var colaboradoresComSaldo = {};
        var totalPeriodos = registrosSaldo.length;

        registrosSaldo.forEach(function (item) {
            var saldo = that.parseNumero(item.SALDO);
            var diasGozados = that.parseNumero(item["DIAS GOZADOS"]);

            somaSaldo += saldo;
            somaDiasGozados += diasGozados;

            if (saldo > 0) {
                var chaveColaborador =
                    String(item.COLIGADA || "") +
                    "|" +
                    String(item.CHAPA || item.NOME || "");

                colaboradoresComSaldo[chaveColaborador] = true;
            }

            var vencimentoTexto = that.obterVencimento30(item);
            var vencimento30 = that.parseData(vencimentoTexto);

            if (!vencimento30) {
                return;
            }

            var diferencaDias = Math.floor(
                (vencimento30.getTime() - hoje.getTime()) / 86400000
            );

            if (diferencaDias < 0 || diferencaDias > 30) {
                return;
            }

            if (diferencaDias <= 7) {
                vencendoAte7++;
            } else if (diferencaDias <= 15) {
                vencendo8a15++;
            } else {
                vencendo16a30++;
            }
        });

        var deFeriasAgora = 0;
        var programadasEm30 = 0;
        var diasProgramadosEm30 = 0;

        registrosMarcadas.forEach(function (item) {
            var inicio = that.parseData(item.DATAINICIO);
            var fim = that.parseData(item.DATAFIM);
            var situacao = String(item.SITUACAOFERIAS || "").toUpperCase();

            if (!inicio || !fim || situacao === "C") {
                return;
            }

            if (hoje >= inicio && hoje <= fim) {
                deFeriasAgora++;
            }

            if (
                (situacao === "P" || situacao === "M")
                && inicio >= hoje
                && inicio <= em30Dias
            ) {
                programadasEm30++;
                diasProgramadosEm30 += that.parseNumero(item.DFERIAS);
            }
        });

        var totalColaboradores = Object.keys(colaboradoresComSaldo).length;
        var vencendoEm30 =
            vencendoAte7 +
            vencendo8a15 +
            vencendo16a30;

        return {
            saldoTotal: Math.round(somaSaldo * 100) / 100,

            totalColaboradores: totalColaboradores,
            totalPeriodos: totalPeriodos,

            diasGozados: Math.round(somaDiasGozados * 100) / 100,

            saldoMedio: totalColaboradores > 0
                ? Math.round((somaSaldo / totalColaboradores) * 100) / 100
                : 0,

            vencendoEm30: vencendoEm30,
            vencendoAte7: vencendoAte7,
            vencendo8a15: vencendo8a15,
            vencendo16a30: vencendo16a30,

            deFeriasAgora: deFeriasAgora,

            programadasEm30: programadasEm30,
            diasProgramadosEm30: diasProgramadosEm30
        };
    },

    agruparSaldoPorSecao: function (registros) {
        var that = this;
        var secoes = {};

        registros.forEach(function (item) {
            var secao = item["SEÇÃO"] || "Não informado";

            if (!secoes[secao]) {
                secoes[secao] = 0;
            }

            secoes[secao] += that.parseNumero(item.SALDO);
        });

        return secoes;
    },

    saldoEGozadoPorSecao: function (registros) {
        var that = this;
        var secoes = {};

        registros.forEach(function (item) {
            var secao = String(
                item["SEÇÃO"] || "Não informado"
            ).trim();

            if (!secoes[secao]) {
                secoes[secao] = {
                    secao: secao,
                    saldo: 0,
                    diasGozados: 0,
                    colaboradores: {}
                };
            }

            secoes[secao].saldo += that.parseNumero(
                item.SALDO
            );

            secoes[secao].diasGozados += that.parseNumero(
                item["DIAS GOZADOS"]
            );

            var chaveColaborador =
                String(item.COLIGADA || "") +
                "|" +
                String(item.CHAPA || item.NOME || "");

            secoes[secao].colaboradores[chaveColaborador] = true;
        });

        var resultado = [];

        Object.keys(secoes).forEach(function (secao) {
            var item = secoes[secao];

            var totalColaboradores =
                Object.keys(item.colaboradores).length;

            resultado.push({
                secao: item.secao,

                saldo:
                    Math.round(item.saldo * 100) / 100,

                diasGozados:
                    Math.round(item.diasGozados * 100) / 100,

                colaboradores: totalColaboradores,

                saldoMedio: totalColaboradores > 0
                    ? Math.round(
                        (
                            item.saldo /
                            totalColaboradores
                        ) * 100
                    ) / 100
                    : 0
            });
        });

        resultado.sort(function (a, b) {
            return b.saldo - a.saldo;
        });

        return resultado;
    },

    rotuloSituacao: function (codigo) {
        var rotulos = {
            "P": "Programada",
            "M": "Marcada",
            "G": "Gozada",
            "C": "Cancelada"
        };

        codigo = codigo || "";

        return rotulos[codigo] || (codigo || "Não informado");
    },

    agruparMarcadasPorSituacao: function (registros) {
        var that = this;
        var contagem = {};

        registros.forEach(function (item) {
            var label = that.rotuloSituacao(item.SITUACAOFERIAS);

            if (!contagem[label]) {
                contagem[label] = 0;
            }

            contagem[label]++;
        });

        return contagem;
    },

    proximosVencimentos: function (registros, limite) {
        var that = this;

        var hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        var em30Dias = new Date(hoje.getTime());
        em30Dias.setDate(em30Dias.getDate() + 30);

        return registros
            .map(function (item) {
                var vencimentoTexto = that.obterVencimento30(item);

                return {
                    nome: item.NOME,
                    secao: item["SEÇÃO"] || "-",
                    saldo: that.parseNumero(item.SALDO),
                    vencimentoTexto: vencimentoTexto || "-",
                    vencimentoData: that.parseData(vencimentoTexto)
                };
            })
            .filter(function (item) {
                return item.vencimentoData !== null
                    && item.vencimentoData >= hoje
                    && item.vencimentoData <= em30Dias;
            })
            .sort(function (a, b) {
                return a.vencimentoData - b.vencimentoData;
            })
            .slice(0, limite || 10);
    },

    colaboradoresDeFerias: function (registrosMarcadas) {
        var that = this;
        var hoje = new Date();

        return registrosMarcadas
            .filter(function (item) {
                var inicio = that.parseData(item.DATAINICIO);
                var fim = that.parseData(item.DATAFIM);

                return inicio !== null && fim !== null && hoje >= inicio && hoje <= fim;
            })
            .map(function (item) {
                return {
                    nome: item.NOME,
                    secao: item.DESCRICAO || "-",
                    inicio: item.DATAINICIO,
                    fim: item.DATAFIM
                };
            });
    }

};

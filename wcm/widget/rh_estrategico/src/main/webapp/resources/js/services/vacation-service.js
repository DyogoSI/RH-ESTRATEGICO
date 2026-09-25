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

        return RHDatasetService.buscar("ds_rh_ferias_marcadas", constraints);
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

        return new Date(Number(partes[2]), Number(partes[1]) - 1, Number(partes[0]));
    },

    calcularResumo: function (registrosSaldo, registrosMarcadas) {
        var that = this;
        var hoje = new Date();
        var em30Dias = new Date();
        em30Dias.setDate(hoje.getDate() + 30);

        var somaSaldo = 0;
        var vencendoEm30 = 0;

        registrosSaldo.forEach(function (item) {
            var vencimento30 = that.parseData(item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"]);

            somaSaldo += that.parseNumero(item.SALDO);

            if (vencimento30 && vencimento30 >= hoje && vencimento30 <= em30Dias) {
                vencendoEm30++;
            }
        });

        var deFeriasAgora = 0;

        registrosMarcadas.forEach(function (item) {
            var inicio = that.parseData(item.DATAINICIO);
            var fim = that.parseData(item.DATAFIM);

            if (inicio && fim && hoje >= inicio && hoje <= fim) {
                deFeriasAgora++;
            }
        });

        var totalColaboradores = registrosSaldo.length;

        return {
            totalColaboradores: totalColaboradores,
            saldoMedio: totalColaboradores > 0
                ? Math.round((somaSaldo / totalColaboradores) * 100) / 100
                : 0,
            vencendoEm30: vencendoEm30,
            deFeriasAgora: deFeriasAgora
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

    agruparMarcadasPorSituacao: function (registros) {
        var rotulos = {
            "P": "Programada",
            "M": "Marcada",
            "G": "Gozada",
            "C": "Cancelada"
        };

        var contagem = {};

        registros.forEach(function (item) {
            var codigo = item.SITUACAOFERIAS || "";
            var label = rotulos[codigo] || (codigo || "Não informado");

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

        return registros
            .map(function (item) {
                return {
                    nome: item.NOME,
                    secao: item["SEÇÃO"] || "-",
                    saldo: that.parseNumero(item.SALDO),
                    vencimentoTexto: item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"] || "-",
                    vencimentoData: that.parseData(item["VENCIMENTO 30 DIAS - ANTERIOR À DATA LIMITE"])
                };
            })
            .filter(function (item) {
                return item.vencimentoData !== null && item.vencimentoData >= hoje;
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

var RHLeaveService = {

    DIAS_LONGO_PRAZO: 30,

    buscar: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint("COLIGADA", filtros.empresa)
            );
        }

        if (filtros.filial) {
            constraints.push(
                RHDatasetService.criarConstraint("FILIAL", filtros.filial)
            );
        }

        var registros = RHDatasetService.buscar("ds_rh_afastamentos", constraints);

        return this.filtrarPeriodo(registros, filtros);
    },

    filtrarPeriodo: function (registros, filtros) {
        if (!filtros.dataInicio && !filtros.dataFim) {
            return registros;
        }

        var that = this;
        var inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        var fim = filtros.dataFim ? new Date(filtros.dataFim) : null;

        return registros.filter(function (item) {
            var dataInicioAfastamento = that.parseData(item["INICIO DO AFASTAMENTO"]);

            if (!dataInicioAfastamento) {
                return false;
            }

            if (inicio && dataInicioAfastamento < inicio) {
                return false;
            }

            if (fim && dataInicioAfastamento > fim) {
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

    status: function (item) {
        var fim = this.parseData(item["FIM DO AFASTAMENTO"]);
        return fim === null ? "Em Aberto" : "Encerrado";
    },

    tipoAgrupado: function (item) {
        var tipo = item["TIPO DE AFASTAMENTO"] || "";
        var limpo = tipo.replace(/^[A-Za-z]\s*-\s*/, "").trim();

        return limpo || "Não informado";
    },

    ehAcidenteTrabalho: function (item) {
        var tipo = String(item["TIPO DE AFASTAMENTO"] || "");
        return /^T\s*-/i.test(tipo);
    },

    faixaDuracao: function (dias) {
        if (dias <= 3) {
            return "Até 3 dias";
        }

        if (dias <= 15) {
            return "4 a 15 dias";
        }

        return "Acima de 15 dias";
    },

    calcularResumo: function (registros) {
        var that = this;

        var total = registros.length;
        var diasPerdidos = 0;
        var afastadosAgora = 0;
        var acidentesTrabalho = 0;

        registros.forEach(function (item) {
            diasPerdidos += that.parseNumero(item["DIAS DE AFASTAMENTO"]);

            if (that.status(item) === "Em Aberto") {
                afastadosAgora++;
            }

            if (that.ehAcidenteTrabalho(item)) {
                acidentesTrabalho++;
            }
        });

        return {
            total: total,
            diasPerdidos: diasPerdidos,
            afastadosAgora: afastadosAgora,
            mediaDias: total > 0 ? Math.round((diasPerdidos / total) * 10) / 10 : 0,
            acidentesTrabalho: acidentesTrabalho
        };
    },

    agruparPorTipo: function (registros) {
        var that = this;
        var contagem = {};

        registros.forEach(function (item) {
            var tipo = that.tipoAgrupado(item);

            if (!contagem[tipo]) {
                contagem[tipo] = 0;
            }

            contagem[tipo]++;
        });

        return contagem;
    },

    agruparPorDuracao: function (registros) {
        var that = this;
        var contagem = {
            "Até 3 dias": 0,
            "4 a 15 dias": 0,
            "Acima de 15 dias": 0
        };

        registros.forEach(function (item) {
            var faixa = that.faixaDuracao(that.parseNumero(item["DIAS DE AFASTAMENTO"]));
            contagem[faixa]++;
        });

        return contagem;
    },

    rankingPorSecao: function (registros, limite) {
        var that = this;
        var secoes = {};

        registros.forEach(function (item) {
            var secao = item["SEÇÃO"] || "Não informado";
            var dias = that.parseNumero(item["DIAS DE AFASTAMENTO"]);

            if (!secoes[secao]) {
                secoes[secao] = 0;
            }

            secoes[secao] += dias;
        });

        return Object.keys(secoes)
            .map(function (secao) {
                return { secao: secao, dias: secoes[secao] };
            })
            .filter(function (item) {
                return item.dias > 0;
            })
            .sort(function (a, b) {
                return b.dias - a.dias;
            })
            .slice(0, limite || 8);
    },

    afastadosLongoPrazo: function (registros, limiteQtd) {
        var that = this;

        return registros
            .filter(function (item) {
                return that.status(item) === "Em Aberto"
                    && that.parseNumero(item["DIAS DE AFASTAMENTO"]) >= that.DIAS_LONGO_PRAZO;
            })
            .map(function (item) {
                return {
                    chapa: item.CHAPA,
                    nome: item.NOME,
                    secao: item["SEÇÃO"] || "-",
                    tipo: that.tipoAgrupado(item),
                    inicio: item["INICIO DO AFASTAMENTO"] || "-",
                    inicioData: that.parseData(item["INICIO DO AFASTAMENTO"]),
                    dias: that.parseNumero(item["DIAS DE AFASTAMENTO"])
                };
            })
            .sort(function (a, b) {
                var dataA = a.inicioData ? a.inicioData.getTime() : 0;
                var dataB = b.inicioData ? b.inicioData.getTime() : 0;

                return dataB - dataA;
            })
            .slice(0, limiteQtd || 15);
    }

};

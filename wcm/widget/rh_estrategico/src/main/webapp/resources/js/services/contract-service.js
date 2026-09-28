var RHContractService = {

    LIMITE_DIAS_EXPIRACAO: 45,

    buscar: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint("CODCOLIGADA", filtros.empresa)
            );
        }

        // Nesse dataset a coluna é "FILIAL" (não "CODFILIAL" como em cotas)
        if (filtros.filial) {
            constraints.push(
                RHDatasetService.criarConstraint("FILIAL", filtros.filial)
            );
        }

        var registros = RHDatasetService.buscar("ds_rh_contratos", constraints);

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
            var admissao = that.parseData(item.ADMISSAO);

            if (!admissao) {
                return false;
            }

            if (inicio && admissao < inicio) {
                return false;
            }

            if (fim && admissao > fim) {
                return false;
            }

            return true;
        });
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

    classificarTipo: function (item) {
        var contratoPrazo = String(item.CONTRATO_PRAZO || "").toUpperCase();
        var tipoContratoPrazo = String(item.TIPO_CONTRATOPRAZO || "").toUpperCase();
        var funcao = String(item.FUNCAO || "").toUpperCase();

        if (contratoPrazo === "INDETERMINADO") {
            return "Indeterminado";
        }

        if (funcao.indexOf("APRENDIZ") >= 0) {
            return "Aprendiz";
        }

        if (funcao.indexOf("ESTAGI") >= 0) {
            return "Estágio";
        }

        if (tipoContratoPrazo === "PERIODO EXPERIENCIA") {
            return "Experiência";
        }

        if (contratoPrazo === "PRAZO DETERMINADO") {
            return "Prazo Determinado";
        }

        return "Não informado";
    },

    calcularStatus: function (item, hoje, limite) {
        var tipo = this.classificarTipo(item);

        if (tipo === "Indeterminado") {
            return "Indeterminado";
        }

        var fim = this.parseData(item.FIM_CONTRATO);

        if (!fim) {
            return "Ativo";
        }

        if (fim < hoje) {
            return "Expirado";
        }

        if (fim <= limite) {
            return "Prestes a Expirar";
        }

        return "Ativo";
    },

    calcularResumo: function (registros) {
        var that = this;
        var hoje = new Date();
        var limite = new Date(hoje);
        limite.setDate(hoje.getDate() + this.LIMITE_DIAS_EXPIRACAO);

        var determinadosAtivos = 0;
        var prestesAExpirar = 0;
        var expirados = 0;
        var indeterminados = 0;

        var somaPermanencia = 0;
        var countPermanencia = 0;

        registros.forEach(function (item) {
            var status = that.calcularStatus(item, hoje, limite);

            if (status === "Indeterminado") {
                indeterminados++;
                return;
            }

            if (status === "Expirado") {
                expirados++;
            } else {
                determinadosAtivos++;

                if (status === "Prestes a Expirar") {
                    prestesAExpirar++;
                }
            }

            var admissao = that.parseData(item.ADMISSAO);
            var fim = that.parseData(item.FIM_CONTRATO);

            if (admissao && fim) {
                var dias = Math.round((fim - admissao) / (1000 * 60 * 60 * 24));

                if (dias > 0) {
                    somaPermanencia += dias;
                    countPermanencia++;
                }
            }
        });

        return {
            determinadosAtivos: determinadosAtivos,
            prestesAExpirar: prestesAExpirar,
            expirados: expirados,
            indeterminados: indeterminados,
            permanenciaMedia: countPermanencia > 0
                ? Math.round(somaPermanencia / countPermanencia)
                : 0
        };
    },

    agruparPorStatus: function (registros) {
        var that = this;
        var hoje = new Date();
        var limite = new Date(hoje);
        limite.setDate(hoje.getDate() + this.LIMITE_DIAS_EXPIRACAO);

        var contagem = {
            "Ativo": 0,
            "Prestes a Expirar": 0,
            "Expirado": 0,
            "Indeterminado": 0
        };

        registros.forEach(function (item) {
            var status = that.calcularStatus(item, hoje, limite);
            contagem[status] = (contagem[status] || 0) + 1;
        });

        return contagem;
    },

    agruparPorTipo: function (registros) {
        var that = this;
        var contagem = {};

        registros.forEach(function (item) {
            var tipo = that.classificarTipo(item);

            if (!contagem[tipo]) {
                contagem[tipo] = 0;
            }

            contagem[tipo]++;
        });

        return contagem;
    },

    proximosVencimentos: function (registros, limiteQtd) {
        var that = this;
        var hoje = new Date();

        return registros
            .map(function (item) {
                var fim = that.parseData(item.FIM_CONTRATO);

                return {
                    nome: item.NOME,
                    funcao: item.FUNCAO || "-",
                    tipo: that.classificarTipo(item),
                    fimTexto: item.FIM_CONTRATO || "-",
                    fimData: fim,
                    diasRestantes: fim
                        ? Math.round((fim - hoje) / (1000 * 60 * 60 * 24))
                        : null
                };
            })
            .filter(function (item) {
                return item.fimData !== null && item.diasRestantes >= 0;
            })
            .sort(function (a, b) {
                return a.fimData - b.fimData;
            })
            .slice(0, limiteQtd || 10);
    }

};

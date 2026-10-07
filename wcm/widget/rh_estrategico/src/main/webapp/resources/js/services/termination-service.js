var RHTerminationService = {

    // Ordem "natural" da faixa de tempo de empresa (não alfabética nem por
    // frequência) — usada no gráfico de ranking pra ficar cronológica
    ORDEM_FAIXA_TEMPO: ["Até 90 dias", "91 a 180 dias", "181 a 360 dias", "1 a 3 anos", "3 a 5 anos", "Mais de 5 anos"],

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

        var registros = RHDatasetService.buscar("ds_rh_rescisoes", constraints);

        return this.filtrarPeriodo(registros, filtros);
    },

    // Período global filtra pela data da rescisão (DATADEMISSAO)
    filtrarPeriodo: function (registros, filtros) {
        if (!filtros.dataInicio && !filtros.dataFim) {
            return registros;
        }

        var that = this;
        var inicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
        var fim = filtros.dataFim ? new Date(filtros.dataFim) : null;

        return registros.filter(function (item) {
            var data = that.parseData(item.DATADEMISSAO);

            if (!data) {
                return false;
            }

            if (inicio && data < inicio) {
                return false;
            }

            if (fim && data > fim) {
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

    // "Inic.Empregador sem justa causa" = desligamento por iniciativa da
    // empresa (involuntário) — a métrica de turnover involuntário mais
    // comum em RH, em oposição a pedido de demissão, fim de contrato etc.
    ehIniciativaEmpresa: function (item) {
        return /^Inic\.?\s*Empregador/i.test(String(item.DESCRICAO_TIPO_DEMISSAO || ""));
    },

    calcularResumo: function (registros) {
        var that = this;

        var total = registros.length;
        var somaTempoAnos = 0;
        var somaLiquido = 0;
        var somaFgts = 0;
        var iniciativaEmpresa = 0;

        registros.forEach(function (item) {
            somaTempoAnos += that.parseNumero(item.TEMPO_EMPRESA_ANOS);
            somaLiquido += that.parseNumero(item.TOTAL_LIQUIDO);
            somaFgts += that.parseNumero(item.TOTAL_FGTS_40);

            if (that.ehIniciativaEmpresa(item)) {
                iniciativaEmpresa++;
            }
        });

        return {
            total: total,
            tempoMedioAnos: total > 0 ? Math.round((somaTempoAnos / total) * 10) / 10 : 0,
            totalLiquido: somaLiquido,
            totalFgts: somaFgts,
            iniciativaEmpresa: iniciativaEmpresa
        };
    },

    // "ANO_MES_RESCISAO" já vem pronto no CSV como "AAAA-MM", então não
    // precisa derivar de DATADEMISSAO pra agrupar por mês
    agruparPorMes: function (registros) {
        var contagem = {};

        registros.forEach(function (item) {
            var chave = item.ANO_MES_RESCISAO;

            if (!chave) {
                return;
            }

            if (!contagem[chave]) {
                contagem[chave] = 0;
            }

            contagem[chave]++;
        });

        return contagem;
    },

    agruparPorMotivo: function (registros) {
        var contagem = {};

        registros.forEach(function (item) {
            var motivo = item.DESCRICAO_MOTIVO_RESCISAO || "Não informado";

            if (!contagem[motivo]) {
                contagem[motivo] = 0;
            }

            contagem[motivo]++;
        });

        return contagem;
    },

    agruparPorFaixaTempo: function (registros) {
        var contagem = {};

        this.ORDEM_FAIXA_TEMPO.forEach(function (faixa) {
            contagem[faixa] = 0;
        });

        registros.forEach(function (item) {
            var faixa = item.FAIXA_TEMPO_EMPRESA || "Não informado";

            if (contagem[faixa] === undefined) {
                contagem[faixa] = 0;
            }

            contagem[faixa]++;
        });

        return contagem;
    },

    ultimasRescisoes: function (registros, limite) {
        var that = this;

        return registros
            .map(function (item) {
                return {
                    chapa: item.CHAPA,
                    nome: item.NOME,
                    secao: item.NOME_SECAO || "-",
                    funcao: item.NOME_FUNCAO || "-",
                    motivo: item.DESCRICAO_MOTIVO_RESCISAO || "-",
                    tipo: item.DESCRICAO_TIPO_DEMISSAO || "-",
                    dataDemissao: item.DATADEMISSAO || "-",
                    dataDemissaoData: that.parseData(item.DATADEMISSAO),
                    tempoEmpresa: item.FAIXA_TEMPO_EMPRESA || "-"
                };
            })
            .sort(function (a, b) {
                var dataA = a.dataDemissaoData ? a.dataDemissaoData.getTime() : 0;
                var dataB = b.dataDemissaoData ? b.dataDemissaoData.getTime() : 0;

                return dataB - dataA;
            })
            .slice(0, limite || 20);
    }

};

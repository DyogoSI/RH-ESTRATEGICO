var RHQuotaService = {

    LIMITE_DIAS_VENCIMENTO: 45,

    buscarPcd: function (filtros) {
        return RHDatasetService.buscar("ds_rh_cotas_pcd", this.criarConstraints(filtros));
    },

    buscarAprendiz: function (filtros) {
        return RHDatasetService.buscar("ds_rh_cotas_aprendiz", this.criarConstraints(filtros));
    },

    buscarAprendizAtuais: function (filtros) {
        return RHDatasetService.buscar("ds_rh_cotas_aprendiz_atuais", this.criarConstraints(filtros));
    },

    buscarPcdAtuais: function (filtros) {
        return RHDatasetService.buscar("ds_rh_cotas_pcd_atuais", this.criarConstraints(filtros));
    },

    criarConstraints: function (filtros) {
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

        return constraints;
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

    statusPcd: function (item) {
        var cota = this.parseNumero(item.COTA_CALCULADA);
        var atual = this.parseNumero(item.PCD_ATUAIS);

        if (cota <= 0) {
            return "Não Aplicável";
        }

        if (atual >= cota) {
            return "Cumprida";
        }

        if (atual > 0) {
            return "Parcialmente Cumprida";
        }

        return "Não Cumprida";
    },

    statusAprendiz: function (item) {
        var minimo = this.parseNumero(item.QTD_APRENDIZ_MINIMO);
        var atual = this.parseNumero(item.QTD_APRENDIZ_ATUAL);

        if (minimo <= 0) {
            return "Não Aplicável";
        }

        if (atual >= minimo) {
            return "Cumprida";
        }

        if (atual > 0) {
            return "Parcialmente Cumprida";
        }

        return "Não Cumprida";
    },

    resumoPcd: function (registros) {
        var that = this;

        var base = 0;
        var cota = 0;
        var atual = 0;
        var faltante = 0;

        registros.forEach(function (item) {
            var itemCota = that.parseNumero(item.COTA_CALCULADA);
            var itemAtual = that.parseNumero(item.PCD_ATUAIS);

            base += that.parseNumero(item.BASE_CALCULO);
            cota += itemCota;
            atual += itemAtual;
            faltante += Math.max(itemCota - itemAtual, 0);
        });

        return {
            base: base,
            cota: cota,
            atual: atual,
            faltante: faltante,
            percentual: cota > 0 ? Math.round((atual / cota) * 100) : null
        };
    },

    resumoAprendiz: function (registros) {
        var that = this;

        var base = 0;
        var minimo = 0;
        var atual = 0;
        var faltante = 0;

        registros.forEach(function (item) {
            var itemMinimo = that.parseNumero(item.QTD_APRENDIZ_MINIMO);
            var itemAtual = that.parseNumero(item.QTD_APRENDIZ_ATUAL);

            base += that.parseNumero(item.QTD_COLABORADORES_BASE);
            minimo += itemMinimo;
            atual += itemAtual;
            faltante += Math.max(itemMinimo - itemAtual, 0);
        });

        return {
            base: base,
            minimo: minimo,
            atual: atual,
            faltante: faltante,
            percentual: minimo > 0 ? Math.round((atual / minimo) * 100) : null
        };
    },

    agruparStatusPcd: function (registros) {
        var that = this;
        var contagem = {
            "Cumprida": 0,
            "Parcialmente Cumprida": 0,
            "Não Cumprida": 0,
            "Não Aplicável": 0
        };

        registros.forEach(function (item) {
            var status = that.statusPcd(item);
            contagem[status] = (contagem[status] || 0) + 1;
        });

        return contagem;
    },

    agruparStatusAprendiz: function (registros) {
        var that = this;
        var contagem = {
            "Cumprida": 0,
            "Parcialmente Cumprida": 0,
            "Não Cumprida": 0,
            "Não Aplicável": 0
        };

        registros.forEach(function (item) {
            var status = that.statusAprendiz(item);
            contagem[status] = (contagem[status] || 0) + 1;
        });

        return contagem;
    },

    rankingDeficit: function (registrosPcd, registrosAprendiz, limite) {
        var that = this;
        var filiais = {};

        registrosPcd.forEach(function (item) {
            var chave = item.CODCOLIGADA + "_" + item.CODFILIAL;
            var deficit = Math.max(
                that.parseNumero(item.COTA_CALCULADA) - that.parseNumero(item.PCD_ATUAIS),
                0
            );

            if (!filiais[chave]) {
                filiais[chave] = { nome: item.NOME_FILIAL || chave, deficit: 0 };
            }

            filiais[chave].deficit += deficit;
        });

        registrosAprendiz.forEach(function (item) {
            var chave = item.CODCOLIGADA + "_" + item.CODFILIAL;
            var deficit = Math.max(
                that.parseNumero(item.QTD_APRENDIZ_MINIMO) - that.parseNumero(item.QTD_APRENDIZ_ATUAL),
                0
            );

            if (!filiais[chave]) {
                filiais[chave] = { nome: item.NOME_FILIAL || chave, deficit: 0 };
            }

            filiais[chave].deficit += deficit;
        });

        return Object.keys(filiais)
            .map(function (chave) {
                return filiais[chave];
            })
            .filter(function (item) {
                return item.deficit > 0;
            })
            .sort(function (a, b) {
                return b.deficit - a.deficit;
            })
            .slice(0, limite || 8);
    },

    tabelaPcd: function (registros) {
        var that = this;

        return registros.map(function (item) {
            var cota = that.parseNumero(item.COTA_CALCULADA);
            var atual = that.parseNumero(item.PCD_ATUAIS);
            var percentual = cota > 0 ? Math.round((atual / cota) * 100) : null;

            return {
                cnpjColigada: item.CNPJ_COLIGADA || "-",
                codColigada: item.CODCOLIGADA || "-",
                nomeColigada: item.NOME_COLIGADA || "-",
                codFilial: item.CODFILIAL || "-",
                filial: item.NOME_FILIAL || "-",
                cnpjFilial: item.CNPJ_FILIAL || "-",
                base: that.parseNumero(item.BASE_CALCULO),
                nroFaixa: item.NROFAIXA || "-",
                limiteSuperior: item.LIMITESUPERIOR || "-",
                percentualLegal: item.PERCENTUAL || "-",
                atual: atual,
                cotaBruta: item.COTA_BRUTA || "-",
                cota: cota,
                faltante: Math.max(cota - atual, 0),
                percentual: percentual,
                percentualTexto: percentual !== null ? percentual + "%" : "-",
                status: that.statusPcd(item)
            };
        });
    },

    tabelaAprendiz: function (registros) {
        var that = this;

        return registros.map(function (item) {
            var minimo = that.parseNumero(item.QTD_APRENDIZ_MINIMO);
            var atual = that.parseNumero(item.QTD_APRENDIZ_ATUAL);
            var percentual = minimo > 0 ? Math.round((atual / minimo) * 100) : null;

            return {
                codColigada: item.CODCOLIGADA || "-",
                nomeColigada: item.NOME_COLIGADA || "-",
                cnpjColigada: item.CNPJ_COLIGADA || "-",
                codFilial: item.CODFILIAL || "-",
                filial: item.NOME_FILIAL || "-",
                cnpjFilial: item.CNPJ_FILIAL || "-",
                base: that.parseNumero(item.QTD_COLABORADORES_BASE),
                minimo: minimo,
                maximo: that.parseNumero(item.QTD_APRENDIZ_MAXIMO),
                atual: atual,
                faltante: that.parseNumero(item.QTD_APRENDIZ_FALTANTE),
                percentual: percentual,
                percentualTexto: percentual !== null ? percentual + "%" : "-",
                status: that.statusAprendiz(item)
            };
        });
    },

    listaPcdAtuais: function (registros) {
        return registros.map(function (item) {
            return {
                nome: item.NOME,
                filial: item.NOME_FILIAL || "-",
                funcao: item.NOME_FUNCAO || "-",
                tipoDeficiencia: item.TIPO_DEFICIENCIA || "-",
                admissao: item.DATAADMISSAO || "-"
            };
        });
    },

    listaAprendizAtuais: function (registros) {
        return registros.map(function (item) {
            return {
                nome: item.NOME_FUNCIONARIO,
                filial: item.NOME_FILIAL || "-",
                funcao: item.NOME_FUNCAO || "-",
                admissao: item.DATAADMISSAO || "-",
                fimContrato: item.DATA_FINAL_CONTRATO || "-"
            };
        });
    },

    aprendizesVencendo: function (registrosAtuais, limiteQtd) {
        var that = this;
        var hoje = new Date();

        return registrosAtuais
            .map(function (item) {
                var fim = that.parseData(item.DATA_FINAL_CONTRATO);

                return {
                    nome: item.NOME_FUNCIONARIO,
                    filial: item.NOME_FILIAL || "-",
                    fimTexto: item.DATA_FINAL_CONTRATO || "-",
                    fimData: fim,
                    diasRestantes: fim
                        ? Math.round((fim - hoje) / (1000 * 60 * 60 * 24))
                        : null
                };
            })
            .filter(function (item) {
                return item.fimData !== null
                    && item.diasRestantes >= 0
                    && item.diasRestantes <= that.LIMITE_DIAS_VENCIMENTO;
            })
            .sort(function (a, b) {
                return a.fimData - b.fimData;
            })
            .slice(0, limiteQtd || 10);
    }

};

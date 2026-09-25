var RHAdmissionService = {

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

        var registros = RHDatasetService.buscar("ds_rh_admissoes", constraints);

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
            var data = that.parseData(item.DATAADMISSAO);

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

    categoria: function (item) {
        var categoriaEsocial = item.DESCRICAO_CATEGORIA_ESOCIAL || "";

        if (categoriaEsocial === "Empregado geral") {
            return "CLT";
        }

        if (categoriaEsocial === "Estagiário") {
            return "Estágio";
        }

        if (categoriaEsocial === "Aprendiz") {
            return "Aprendiz";
        }

        return "Outros";
    },

    calcularResumo: function (registros) {
        var that = this;

        var total = registros.length;
        var clt = 0;
        var estagio = 0;
        var aprendiz = 0;
        var outros = 0;
        var somaSalarios = 0;

        registros.forEach(function (item) {
            var categoria = that.categoria(item);

            if (categoria === "CLT") {
                clt++;
            } else if (categoria === "Estágio") {
                estagio++;
            } else if (categoria === "Aprendiz") {
                aprendiz++;
            } else {
                outros++;
            }

            somaSalarios += that.parseNumero(item.SALARIO);
        });

        return {
            total: total,
            clt: clt,
            estagio: estagio,
            aprendiz: aprendiz,
            outros: outros,
            salarioMedio: total > 0
                ? Math.round((somaSalarios / total) * 100) / 100
                : 0
        };
    }

};

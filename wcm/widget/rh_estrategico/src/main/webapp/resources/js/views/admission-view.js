var RHAdmissionView = {

    instanceId: null,
    registros: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        console.log("[RH Estratégico] Visão de Admissões inicializada:", instanceId);

        this.bindKpiClicks();
        this.atualizar();

        RHExport.bind(
            "#rhAdmissionExportar_" + instanceId,
            "#rhAdmissionCaptura_" + instanceId,
            "admissoes"
        );
    },

    atualizar: function () {
        var filtros = RHState.getFiltros();
        var registros = RHAdmissionService.buscar(filtros);
        var resumo = RHAdmissionService.calcularResumo(registros);

        console.log("[RH Estratégico] Dados de Admissões:", registros);

        this.registros = registros;

        $("#rhAdmissionTotal_" + this.instanceId).text(resumo.total);
        $("#rhAdmissionClt_" + this.instanceId).text(resumo.clt);
        $("#rhAdmissionEstagio_" + this.instanceId).text(resumo.estagio);
        $("#rhAdmissionAprendiz_" + this.instanceId).text(resumo.aprendiz);
        $("#rhAdmissionOutros_" + this.instanceId).text(resumo.outros);

        $("#rhAdmissionSalarioMedio_" + this.instanceId).text(
            this.formatarMoeda(resumo.salarioMedio)
        );

        var meses = {};
        var tipos = {};

        registros.forEach(function (item) {
            var data = RHAdmissionService.parseData(item.DATAADMISSAO);

            if (data) {
                var chaveMes = data.getFullYear() + "-" + String(data.getMonth() + 1).padStart(2, "0");
                var labelMes = String(data.getMonth() + 1).padStart(2, "0") + "/" + data.getFullYear();

                if (!meses[chaveMes]) {
                    meses[chaveMes] = { label: labelMes, valor: 0 };
                }

                meses[chaveMes].valor++;
            }

            var tipo = RHAdmissionService.categoria(item);

            if (!tipos[tipo]) {
                tipos[tipo] = 0;
            }

            tipos[tipo]++;
        });

        var chavesMes = Object.keys(meses).sort();
        var chavesTipo = Object.keys(tipos);

        RHCharts.renderAdmission(this.instanceId, {
            porMes: {
                labels: chavesMes.map(function (chave) {
                    return meses[chave].label;
                }),

                valores: chavesMes.map(function (chave) {
                    return meses[chave].valor;
                })
            },

            porTipo: {
                labels: chavesTipo,
                valores: chavesTipo.map(function (tipo) {
                    return tipos[tipo];
                })
            }
        });

        RHDrilldown.fechar("#rhAdmissionDrilldown_" + this.instanceId);
    },

    formatarMoeda: function (valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    },

    bindKpiClicks: function () {
        var that = this;

        RHDrilldown.bind(
            "#rhAdmission_" + this.instanceId,
            "#rhAdmissionDrilldown_" + this.instanceId,
            function (chave) {
                return that.configDrilldown(chave);
            }
        );
    },

    configDrilldown: function (chave) {
        if (!this.registros) {
            return null;
        }

        var servico = RHAdmissionService;

        var filtros = {
            total: function () { return true; },
            clt: function (item) { return servico.categoria(item) === "CLT"; },
            estagio: function (item) { return servico.categoria(item) === "Estágio"; },
            aprendiz: function (item) { return servico.categoria(item) === "Aprendiz"; },
            outros: function (item) { return servico.categoria(item) === "Outros"; },
            salarioMedio: function () { return true; }
        };

        var titulos = {
            total: "Todas as Admissões",
            clt: "Admissões CLT",
            estagio: "Admissões de Estágio",
            aprendiz: "Admissões de Aprendiz",
            outros: "Outras Admissões",
            salarioMedio: "Todas as Admissões (por Salário)"
        };

        if (!filtros[chave]) {
            return null;
        }

        var linhas = this.registros
            .filter(filtros[chave])
            .map(function (item) {
                return {
                    colaborador: item.NOME,
                    cargo: item.NOME_FUNCAO || "-",
                    secao: item.NOME_SECAO || "-",
                    dataAdmissao: item.DATAADMISSAO || "-",
                    tipo: servico.categoria(item),
                    salario: item.SALARIO || "-"
                };
            });

        return {
            titulo: titulos[chave],
            colunas: [
                { campo: "colaborador", rotulo: "Colaborador" },
                { campo: "cargo", rotulo: "Cargo" },
                { campo: "secao", rotulo: "Seção" },
                { campo: "dataAdmissao", rotulo: "Data Admissão" },
                { campo: "tipo", rotulo: "Tipo" },
                { campo: "salario", rotulo: "Salário" }
            ],
            linhas: linhas
        };
    }

};

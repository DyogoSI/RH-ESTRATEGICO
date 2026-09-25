var RHFilters = {

    instanceId: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        this.carregarEmpresas();
        this.carregarFiliais("");
        this.bindEvents();

        console.log("[RH Estratégico] Filtros inicializados:", instanceId);
    },

    carregarEmpresas: function () {
        var empresas = RHFilterService.buscarEmpresas();
        var select = $("#rhEmpresa_" + this.instanceId);

        select.empty();
        select.append('<option value="">Todas</option>');

        empresas.forEach(function (item) {
            select.append(
                $("<option>", {
                    value: item.COD_EMPRESA,
                    text: item.EMPRESA
                })
            );
        });
    },

    carregarFiliais: function (empresa) {
        var filiais = RHFilterService.buscarFiliais(empresa);
        var select = $("#rhFilial_" + this.instanceId);

        select.empty();
        select.append('<option value="">Todas</option>');

        filiais.forEach(function (item) {
            select.append(
                $("<option>", {
                    value: item.COD_FILIAL,
                    text: item.FILIAL
                })
            );
        });
    },

    bindEvents: function () {
        var that = this;

        $("#rhDataInicio_" + that.instanceId).on("change", function () {
            RHState.setFiltro("dataInicio", $(this).val());
            that.aplicar();
        });

        $("#rhDataFim_" + that.instanceId).on("change", function () {
            RHState.setFiltro("dataFim", $(this).val());
            that.aplicar();
        });

        $("#rhEmpresa_" + that.instanceId).on("change", function () {
            var empresa = $(this).val();

            RHState.setFiltro("empresa", empresa);
            RHState.setFiltro("filial", "");

            that.carregarFiliais(empresa);
            that.aplicar();
        });

        $("#rhFilial_" + that.instanceId).on("change", function () {
            RHState.setFiltro("filial", $(this).val());
            that.aplicar();
        });

        $("#rhBtnLimparFiltros_" + that.instanceId).on("click", function () {
            that.limpar();
        });
    },

    aplicar: function () {
        console.log("[RH Estratégico] Filtros aplicados:", RHState.getFiltros());

        RHApp.atualizar();
    },

    limpar: function () {
        RHState.resetFiltros();

        $("#rhDataInicio_" + this.instanceId).val("");
        $("#rhDataFim_" + this.instanceId).val("");
        $("#rhEmpresa_" + this.instanceId).val("");
        $("#rhFilial_" + this.instanceId).val("");

        this.aplicar();
    }

};
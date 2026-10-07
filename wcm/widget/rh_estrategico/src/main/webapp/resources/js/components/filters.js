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

    // Ajustar um filtro só guarda o valor (e, no caso da empresa, atualiza
    // a lista de filiais) — nada é recarregado até a pessoa clicar em
    // "Filtrar". Isso evita toda a categoria de bug de recarregar cedo
    // demais (no meio da digitação da data, ou logo após só um dos dois
    // campos de período), e deixa explícito quando a busca realmente roda
    bindEvents: function () {
        var that = this;

        $("#rhDataInicio_" + that.instanceId).on("change", function () {
            RHState.setFiltro("dataInicio", $(this).val());
        });

        $("#rhDataFim_" + that.instanceId).on("change", function () {
            RHState.setFiltro("dataFim", $(this).val());
        });

        $("#rhEmpresa_" + that.instanceId).on("change", function () {
            var empresa = $(this).val();

            RHState.setFiltro("empresa", empresa);
            RHState.setFiltro("filial", "");

            that.carregarFiliais(empresa);
        });

        $("#rhFilial_" + that.instanceId).on("change", function () {
            RHState.setFiltro("filial", $(this).val());
        });

        $("#rhBtnFiltrar_" + that.instanceId).on("click", function () {
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

        // "Seção" mora no mesmo painel mas é controlado pelo RHVacationView
        // (só existe/faz efeito na aba Férias). Disparar "change" nele
        // (em vez de só zerar o valor) avisa o RHVacationView pra também
        // esquecer a seção escolhida, senão ela continuaria filtrando por
        // baixo mesmo depois de "Limpar filtros"
        $("#rhVacationSecao_" + this.instanceId).val("").trigger("change");

        // "Status" e "Tipo de Contrato" são lidos direto do DOM pelo
        // RHContractView a cada renderização (sem estado em cache), então
        // só zerar o valor aqui já é suficiente — não precisa de "change"
        $("#rhContractStatus_" + this.instanceId).val("");
        $("#rhContractTipo_" + this.instanceId).val("");

        // Os 11 campos avançados de Admissões também são lidos direto do
        // DOM pelo RHAdmissionView, mesma lógica acima
        [
            "rhAdmissionSecao_", "rhAdmissionFuncao_", "rhAdmissionSituacao_",
            "rhAdmissionTipoAdmissao_", "rhAdmissionMotivo_", "rhAdmissionCategoriaEsocial_",
            "rhAdmissionSexo_", "rhAdmissionNacionalidade_", "rhAdmissionRaca_",
            "rhAdmissionGrauInstrucao_", "rhAdmissionDeficiencia_"
        ].forEach(function (prefixo) {
            $("#" + prefixo + this.instanceId).val("");
        }, this);

        // "Área", "Tipo" e "Motivo" de Afastamentos, mesma lógica acima
        [
            "rhLeaveSecao_", "rhLeaveTipoAfastamento_", "rhLeaveMotivo_"
        ].forEach(function (prefixo) {
            $("#" + prefixo + this.instanceId).val("");
        }, this);

        // Os 4 campos avançados de Benefícios, mesma lógica acima
        [
            "rhBenefitSecao_", "rhBenefitFuncao_", "rhBenefitPeriodoFolha_", "rhBenefitBeneficio_"
        ].forEach(function (prefixo) {
            $("#" + prefixo + this.instanceId).val("");
        }, this);

        // Os 8 campos avançados de Rescisões, mesma lógica acima
        [
            "rhTerminationSecao_", "rhTerminationFuncao_", "rhTerminationCentroCusto_",
            "rhTerminationMotivo_", "rhTerminationTipo_", "rhTerminationAvisoPrevio_",
            "rhTerminationFaixaTempo_", "rhTerminationFaixaEtaria_"
        ].forEach(function (prefixo) {
            $("#" + prefixo + this.instanceId).val("");
        }, this);

        this.carregarFiliais("");
        this.aplicar();
    }

};

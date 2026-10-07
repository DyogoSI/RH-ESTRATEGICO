var RHApp = {

    instanceId: null,
    viewAtual: "overview",

    viewsCarregadas: {},
    viewsPendentes: {},

    init: function (instanceId) {
        console.log("[RH Estratégico] Inicializando aplicação");

        this.instanceId = instanceId;
        this.viewAtual = "overview";
        this.viewsCarregadas = {};
        this.viewsPendentes = {};

        RHState.init(instanceId);

        RHLoading.init(instanceId);
        RHNavigation.init(instanceId);
        RHFilters.init(instanceId);
        RHTheme.init(instanceId);
        this.bindTopbar(instanceId);

        this.abrirView("overview");
    },

    bindTopbar: function (instanceId) {
        var that = this;

        $("#rhTopbarAtualizar_" + instanceId)
            .off("click.rhTopbar")
            .on("click.rhTopbar", function () {
                that.atualizar();
            });
    },

    getView: function (view) {
        switch (view) {
            case "overview":
                return typeof RHOverviewView !== "undefined"
                    ? RHOverviewView
                    : null;

            case "admission":
                return typeof RHAdmissionView !== "undefined"
                    ? RHAdmissionView
                    : null;

            case "termination":
                return typeof RHTerminationView !== "undefined"
                    ? RHTerminationView
                    : null;

            case "vacation":
                return typeof RHVacationView !== "undefined"
                    ? RHVacationView
                    : null;

            case "leave":
                return typeof RHLeaveView !== "undefined"
                    ? RHLeaveView
                    : null;

            case "contract":
                return typeof RHContractView !== "undefined"
                    ? RHContractView
                    : null;

            case "quota":
                return typeof RHQuotaView !== "undefined"
                    ? RHQuotaView
                    : null;

            case "benefit":
                return typeof RHBenefitView !== "undefined"
                    ? RHBenefitView
                    : null;
        }

        return null;
    },

    abrirView: function (view) {
        var that = this;

        this.viewAtual = view;

        RHNavigation.ativar(view);

        if (!this.viewsCarregadas[view] || this.viewsPendentes[view]) {
            RHLoading.executar(function () {
                that.atualizarView(view);
            });
        }
    },

    atualizarView: function (view) {
        var modulo = this.getView(view);

        if (!modulo) {
            return;
        }

        if (!this.viewsCarregadas[view]) {
            if (typeof modulo.init === "function") {
                modulo.init(this.instanceId);
            }

            this.viewsCarregadas[view] = true;
            this.viewsPendentes[view] = false;

            return;
        }

        if (this.viewsPendentes[view] && typeof modulo.atualizar === "function") {
            modulo.atualizar();
        }

        this.viewsPendentes[view] = false;
    },

    marcarViewsPendentes: function () {
        this.viewsPendentes.overview = true;
        this.viewsPendentes.admission = true;
        this.viewsPendentes.termination = true;
        this.viewsPendentes.vacation = true;
        this.viewsPendentes.leave = true;
        this.viewsPendentes.contract = true;
        this.viewsPendentes.quota = true;
        this.viewsPendentes.benefit = true;
    },

    atualizar: function () {
        var that = this;

        this.marcarViewsPendentes();

        RHLoading.executar(function () {
            that.atualizarView(that.viewAtual);
        });
    }

};
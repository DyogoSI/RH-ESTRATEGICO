var RHTheme = {

    CHAVE_ARMAZENAMENTO: "rh_estrategico_tema",

    instanceId: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        this.aplicar(true, false);
    },

    // Painel com um único tema (escuro): não há mais botão de alternância

    aplicar: function (escuro, recarregarDados) {
        var raiz = document.getElementById("RHEstrategico_" + this.instanceId);

        if (!raiz) {
            return;
        }

        if (escuro) {
            raiz.setAttribute("data-rh-theme", "dark");
        } else {
            raiz.removeAttribute("data-rh-theme");
        }

        if (typeof RHCharts !== "undefined") {
            RHCharts.aplicarTema(escuro);
        }

        if (recarregarDados && typeof RHApp !== "undefined") {
            RHApp.atualizar();
        }
    }

};

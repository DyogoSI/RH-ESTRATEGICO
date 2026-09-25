var RHTheme = {

    CHAVE_ARMAZENAMENTO: "rh_estrategico_tema",

    instanceId: null,

    init: function (instanceId) {
        this.instanceId = instanceId;

        this.aplicar(this.lerPreferencia(), false);
        this.bindBotao();
    },

    // Sem preferência salva ainda, o padrão agora é o tema escuro — só cai
    // pro claro se a pessoa já tiver escolhido isso explicitamente antes
    lerPreferencia: function () {
        try {
            return window.localStorage.getItem(this.CHAVE_ARMAZENAMENTO) !== "claro";
        } catch (e) {
            return true;
        }
    },

    salvarPreferencia: function (escuro) {
        try {
            window.localStorage.setItem(this.CHAVE_ARMAZENAMENTO, escuro ? "escuro" : "claro");
        } catch (e) {
            // localStorage indisponível (navegação privada, etc.) - sem persistência, sem quebrar
        }
    },

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
    },

    bindBotao: function () {
        var that = this;

        $("#rhTopbarTema_" + this.instanceId)
            .off("click.rhTema")
            .on("click.rhTema", function () {
                var novoEstado = !that.lerPreferencia();

                that.salvarPreferencia(novoEstado);
                that.aplicar(novoEstado, true);
            });
    }

};

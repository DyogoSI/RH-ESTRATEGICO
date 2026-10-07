var RHNavigation = {

    instanceId: null,

    init: function (instanceId) {
        this.instanceId = instanceId;
        this.bindEvents();
        this.bindToggle();
    },

    chaveRecolhido: "rhSidebarRecolhida",

    lerRecolhido: function () {
        try {
            // Sem preferência salva, começa recolhida
            return window.localStorage.getItem(this.chaveRecolhido) !== "0";
        } catch (e) {
            return true;
        }
    },

    aplicarRecolhido: function (recolhido) {
        var root = $("#RHEstrategico_" + this.instanceId);

        root.toggleClass("rh-sidebar-recolhida", recolhido);

        root.find(".rh-sidebar-toggle")
            .attr("aria-expanded", recolhido ? "false" : "true")
            .attr("title", recolhido ? "Expandir menu" : "Recolher menu");

        // Gráficos precisam recalcular o tamanho quando a largura do conteúdo muda
        $(window).trigger("resize");
    },

    bindToggle: function () {
        var that = this;

        this.aplicarRecolhido(this.lerRecolhido());

        $("#rhSidebarToggle_" + this.instanceId)
            .off("click.rhSidebar")
            .on("click.rhSidebar", function () {
                var recolhido = !$("#RHEstrategico_" + that.instanceId)
                    .hasClass("rh-sidebar-recolhida");

                try {
                    window.localStorage.setItem(that.chaveRecolhido, recolhido ? "1" : "0");
                } catch (e) {}

                that.aplicarRecolhido(recolhido);
            });
    },

    bindEvents: function () {
        var root = $("#RHEstrategico_" + this.instanceId);

        root.find(".rh-nav-item")
            .off("click.rhNavigation")
            .on("click.rhNavigation", function () {
                var view = $(this).data("rh-view");

                RHApp.abrirView(view);
            });
    },

    ativar: function (view) {
        var root = $("#RHEstrategico_" + this.instanceId);

        // Alguns campos do filtro global só fazem sentido numa aba
        // específica (ex.: "Seção" só existe na aba Férias) — esse atributo
        // deixa o CSS mostrar/esconder esses campos conforme a aba ativa
        root.attr("data-rh-view-atual", view);

        root.find(".rh-nav-item")
            .removeClass("active");

        root.find('.rh-nav-item[data-rh-view="' + view + '"]')
            .addClass("active");

        root.find(".rh-view-container")
            .removeClass("active");

        root.find('[data-rh-content="' + view + '"]')
            .addClass("active");
    }

};
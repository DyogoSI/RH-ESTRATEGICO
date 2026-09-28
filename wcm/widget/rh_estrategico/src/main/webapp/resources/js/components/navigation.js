var RHNavigation = {

    instanceId: null,

    init: function (instanceId) {
        this.instanceId = instanceId;
        this.bindEvents();
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
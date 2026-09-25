var RHLoading = {

    instanceId: null,
    ativo: false,

    init: function (instanceId) {
        this.instanceId = instanceId;
    },

    show: function () {
        this.ativo = true;

        $("#rhLoading_" + this.instanceId)
            .addClass("active");

        this.bloquearControles(true);
    },

    hide: function () {
        this.ativo = false;

        $("#rhLoading_" + this.instanceId)
            .removeClass("active");

        this.bloquearControles(false);
    },

    bloquearControles: function (bloquear) {
        var root = $("#RHEstrategico_" + this.instanceId);

        root.find(".rh-filter-control, .rh-nav-item, .rh-filter-actions button")
            .prop("disabled", bloquear);
    },

    executar: function (callback) {
        var that = this;

        this.show();

        requestAnimationFrame(function () {
            setTimeout(function () {
                try {
                    callback();
                } finally {
                    that.hide();
                }
            }, 30);
        });
    }

};
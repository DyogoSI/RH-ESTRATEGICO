var RHEstrategico = SuperWidget.extend({

    instanceId: null,

    init: function () {
        console.log("[RH Estratégico] Widget carregada:", this.instanceId);

        RHApp.init(this.instanceId);
    }

});
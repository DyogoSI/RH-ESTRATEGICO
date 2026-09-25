var RHState = {

    instanceId: null,

    filtros: {
        dataInicio: "",
        dataFim: "",
        empresa: "",
        filial: "",
        area: ""
    },

    dados: {
        overview: null
    },

    init: function (instanceId) {
        this.instanceId = instanceId;
    },

    setFiltro: function (campo, valor) {
        this.filtros[campo] = valor;
    },

    resetFiltros: function () {
        this.filtros = {
            dataInicio: "",
            dataFim: "",
            empresa: "",
            filial: "",
            area: ""
        };
    },

    getFiltros: function () {
        return this.filtros;
    }

};
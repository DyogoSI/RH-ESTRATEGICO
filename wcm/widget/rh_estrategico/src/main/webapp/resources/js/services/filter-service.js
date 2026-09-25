var RHFilterService = {

    empresas: null,
    filiais: null,

    buscarEmpresas: function () {
        if (!this.empresas) {
            this.empresas = RHDatasetService.buscar(
                "ds_rh_mock_empresas",
                []
            );
        }

        return this.empresas;
    },

    buscarFiliais: function (empresa) {
        if (!this.filiais) {
            this.filiais = RHDatasetService.buscar(
                "ds_rh_mock_filiais",
                []
            );
        }

        if (!empresa) {
            return this.filiais;
        }

        return this.filiais.filter(function (item) {
            return String(item.COD_EMPRESA) === String(empresa);
        });
    }

};
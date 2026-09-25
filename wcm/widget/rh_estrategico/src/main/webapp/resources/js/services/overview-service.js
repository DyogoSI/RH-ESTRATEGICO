var RHOverviewService = {

    buscar: function (filtros) {
        var constraints = [];

        if (filtros.dataInicio) {
            constraints.push(
                RHDatasetService.criarConstraint(
                    "DATA_INICIO",
                    filtros.dataInicio
                )
            );
        }

        if (filtros.dataFim) {
            constraints.push(
                RHDatasetService.criarConstraint(
                    "DATA_FIM",
                    filtros.dataFim
                )
            );
        }

        if (filtros.empresa) {
            constraints.push(
                RHDatasetService.criarConstraint(
                    "COD_EMPRESA",
                    filtros.empresa
                )
            );
        }

        if (filtros.filial) {
            constraints.push(
                RHDatasetService.criarConstraint(
                    "COD_FILIAL",
                    filtros.filial
                )
            );
        }

        return RHDatasetService.buscar(
            "ds_rh_mock_overview",
            constraints
        );
    }

};
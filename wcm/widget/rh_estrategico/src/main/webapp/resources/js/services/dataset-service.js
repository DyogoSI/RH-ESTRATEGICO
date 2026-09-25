var RHDatasetService = {

    criarConstraint: function (campo, valor) {
        return DatasetFactory.createConstraint(
            campo,
            valor,
            valor,
            ConstraintType.MUST
        );
    },

    buscar: function (datasetName, constraints) {
        try {
            var dataset = DatasetFactory.getDataset(
                datasetName,
                null,
                constraints || null,
                null
            );

            if (!dataset || !dataset.values) {
                return [];
            }

            var valores = dataset.values;

            if (valores.length === 1 && valores[0].ERRO !== undefined) {
                console.error(
                    "[RH Estratégico] Dataset " + datasetName + " retornou erro: " + valores[0].ERRO
                );

                return [];
            }

            return valores;

        } catch (error) {
            console.error(
                "[RH Estratégico] Erro ao consultar dataset " + datasetName,
                error
            );

            return [];
        }
    }

};
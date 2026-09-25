function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("COD_EMPRESA");
    dataset.addColumn("COD_FILIAL");
    dataset.addColumn("FILIAL");

    var empresa = getConstraintValue(constraints, "COD_EMPRESA");

    var dados = [
        ["1", "1", "Matriz"],
        ["1", "2", "Unidade Sul de Minas"],
        ["2", "1", "Matriz"],
        ["2", "2", "Unidade São Paulo"]
    ];

    for (var i = 0; i < dados.length; i++) {
        if (empresa && dados[i][0] != empresa) {
            continue;
        }

        dataset.addRow(dados[i]);
    }

    return dataset;
}

function getConstraintValue(constraints, fieldName) {
    if (!constraints) {
        return "";
    }

    for (var i = 0; i < constraints.length; i++) {
        if (constraints[i].fieldName == fieldName) {
            return constraints[i].initialValue || "";
        }
    }

    return "";
}

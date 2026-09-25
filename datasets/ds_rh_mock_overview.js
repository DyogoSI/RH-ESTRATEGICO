function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("DATA");
    dataset.addColumn("MES");
    dataset.addColumn("COD_EMPRESA");
    dataset.addColumn("COD_FILIAL");
    dataset.addColumn("HEADCOUNT");
    dataset.addColumn("ADMISSOES");
    dataset.addColumn("RESCISOES");
    dataset.addColumn("AFASTAMENTOS");
    dataset.addColumn("FERIAS");

    var dataInicio = getConstraintValue(constraints, "DATA_INICIO");
    var dataFim = getConstraintValue(constraints, "DATA_FIM");
    var empresa = getConstraintValue(constraints, "COD_EMPRESA");
    var filial = getConstraintValue(constraints, "COD_FILIAL");

    var meses = [
        ["2026-01-01", "Jan", 480, 18, 12, 5, 14],
        ["2026-02-01", "Fev", 488, 22, 14, 6, 18],
        ["2026-03-01", "Mar", 485, 16, 19, 8, 21],
        ["2026-04-01", "Abr", 499, 25, 11, 7, 24],
        ["2026-05-01", "Mai", 514, 31, 16, 9, 20],
        ["2026-06-01", "Jun", 520, 27, 21, 7, 16]
    ];

    var unidades = [
        { empresa: "1", filial: "1", peso: 0.40 },
        { empresa: "1", filial: "2", peso: 0.25 },
        { empresa: "2", filial: "1", peso: 0.20 },
        { empresa: "2", filial: "2", peso: 0.15 }
    ];

    for (var i = 0; i < meses.length; i++) {
        var mes = meses[i];

        if (dataInicio && mes[0] < dataInicio) {
            continue;
        }

        if (dataFim && mes[0] > dataFim) {
            continue;
        }

        var headcount = distribuir(mes[2], unidades);
        var admissoes = distribuir(mes[3], unidades);
        var rescisoes = distribuir(mes[4], unidades);
        var afastamentos = distribuir(mes[5], unidades);
        var ferias = distribuir(mes[6], unidades);

        for (var j = 0; j < unidades.length; j++) {
            var unidade = unidades[j];

            if (empresa && unidade.empresa != empresa) {
                continue;
            }

            if (filial && unidade.filial != filial) {
                continue;
            }

            dataset.addRow([
                mes[0],
                mes[1],
                unidade.empresa,
                unidade.filial,
                String(headcount[j]),
                String(admissoes[j]),
                String(rescisoes[j]),
                String(afastamentos[j]),
                String(ferias[j])
            ]);
        }
    }

    return dataset;
}

function distribuir(total, unidades) {
    var valores = [];
    var acumulado = 0;

    for (var i = 0; i < unidades.length; i++) {
        if (i == unidades.length - 1) {
            valores.push(total - acumulado);
        } else {
            var valor = Math.round(total * unidades[i].peso);

            valores.push(valor);
            acumulado += valor;
        }
    }

    return valores;
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
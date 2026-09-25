function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("COD_EMPRESA");
    dataset.addColumn("EMPRESA");

    dataset.addRow(["1", "IRHO Operacional"]);
    dataset.addRow(["2", "IRHO Serviços"]);

    return dataset;
}

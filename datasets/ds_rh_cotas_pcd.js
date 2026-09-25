// DS.FLUIG.0004 - Cotas PCD
// Resumo da cota legal de PCD por coligada e filial: base de cálculo,
// faixa/percentual aplicável, PCDs atuais, cota bruta e cota calculada.
// Colunas do CSV: CNPJ_COLIGADA;CODCOLIGADA;NOME_COLIGADA;CODFILIAL;
// BASE_CALCULO;NROFAIXA;LIMITESUPERIOR;CNPJ_FILIAL;PCD_ATUAIS;PERCENTUAL;
// NOME_FILIAL;COTA_BRUTA;COTA_CALCULADA

function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    try {
        // --- 1. Parâmetros da Busca ---
        var folderId = 14271; // pasta "RH ESTRATEGICO" no GED
        var fileName = "DS.FLUIG.0004- Cotas PCD.CSV";

        // Credenciais do usuário integrador (precisa ter permissão na pasta acima)
        var adminUser = "guilherme-af";
        var adminPass = "Avwc1920.";

        var documentId = null;
        var version = null;
        var companyId = null;
        var physicalFile = null;

        // --- 2. Percorrer a pasta buscando o arquivo pelo Nome ---
        var c1 = DatasetFactory.createConstraint("parentDocumentId", folderId, folderId, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("activeVersion", "true", "true", ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("deleted", "false", "false", ConstraintType.MUST);
        var dsDocs = DatasetFactory.getDataset("document", null, [c1, c2, c3], null);

        if (dsDocs != null && dsDocs.rowsCount > 0) {
            for (var i = 0; i < dsDocs.rowsCount; i++) {
                var docDesc = String(dsDocs.getValue(i, "documentDescription")).toUpperCase();
                var fileDesc = String(dsDocs.getValue(i, "phisicalFile")).toUpperCase();

                if (docDesc === fileName.toUpperCase() || fileDesc === fileName.toUpperCase()) {
                    documentId = dsDocs.getValue(i, "documentPK.documentId");
                    version = dsDocs.getValue(i, "documentPK.version");
                    companyId = dsDocs.getValue(i, "documentPK.companyId");
                    physicalFile = dsDocs.getValue(i, "phisicalFile");
                    break;
                }
            }
        }

        if (documentId == null) {
            throw "Arquivo '" + fileName + "' não encontrado dentro da pasta " + folderId;
        }

        // --- 3. Conectar no Serviço SOAP ---
        var provider = ServiceManager.getService("ECMDocumentService");
        if (provider == null) {
            throw "Serviço 'ECMDocumentService' não cadastrado no Fluig.";
        }
        var locator = provider.instantiate("com.totvs.technology.ecm.dm.ws.ECMDocumentServiceService");
        var service = locator.getDocumentServicePort();

        // --- 4. Conversão para Tipos Primitivos do Java ---
        var jCompanyId = new java.lang.Integer(parseInt(companyId.toString())).intValue();
        var jDocumentId = new java.lang.Integer(parseInt(documentId.toString())).intValue();
        var jVersion = new java.lang.Integer(parseInt(version.toString())).intValue();

        var jUser = new java.lang.String(adminUser);
        var jPass = new java.lang.String(adminPass);
        var jPhysical = new java.lang.String(physicalFile);

        // --- 5. Baixar o arquivo ---
        var byteContent = service.getDocumentContent(
            jUser, jPass, jCompanyId, jDocumentId, jUser, jVersion, jPhysical
        );

        if (byteContent == null || byteContent.length === 0) {
            throw "O arquivo CSV foi encontrado, mas seu conteúdo está vazio.";
        }

        // --- 6. Converter o conteúdo para Texto ---
        var textoJava = new java.lang.String(byteContent, "ISO-8859-1");
        var textoJS = String(textoJava);

        // --- 7. Processar o CSV e APLICAR OS FILTROS ---
        var linhas = textoJS.split(/\r?\n/);
        var isFirstLine = true;
        var colCount = 0;
        var colIndices = {}; // Armazena a posição de cada coluna para usarmos no filtro

        for (var i = 0; i < linhas.length; i++) {
            var line = String(linhas[i]).trim();

            // Ignora linhas em branco
            if (line === "") continue;

            var columns = line.split(";");

            if (isFirstLine) {
                colCount = columns.length;
                for (var c = 0; c < colCount; c++) {
                    var colName = String(columns[c]).replace(/^"|"$/g, '').trim().toUpperCase();
                    dataset.addColumn(colName);
                    colIndices[colName] = c;
                }
                isFirstLine = false;
            } else {
                var rowData = new Array();
                for (var c = 0; c < colCount; c++) {
                    var val = (c < columns.length && columns[c] != null) ? String(columns[c]).replace(/^"|"$/g, '').trim() : "";
                    rowData.push(val);
                }

                // ========================================================
                // LÓGICA DE FILTRO (CONSTRAINTS) - OBRIGATÓRIO PARA O ZOOM
                // ========================================================
                var addRow = true;

                if (constraints != null && constraints.length > 0) {
                    for (var x = 0; x < constraints.length; x++) {
                        var fieldName = String(constraints[x].fieldName).toUpperCase();
                        var initialValue = String(constraints[x].initialValue).trim();
                        var constraintType = constraints[x].constraintType;

                        // Ignora limites internos de banco SQL
                        if (fieldName === "SQLLIMIT") continue;

                        // Se existir a coluna filtrada no CSV (ex: CODCOLIGADA)
                        if (colIndices[fieldName] !== undefined) {
                            var rowValue = String(rowData[colIndices[fieldName]]).trim();

                            // Se for constraint do tipo MUST (Filtro Exato do reloadZoomFilterValues)
                            if (constraintType == ConstraintType.MUST) {
                                if (rowValue !== initialValue) {
                                    addRow = false;
                                    break; // Falhou no filtro, já sai do loop
                                }
                            } else {
                                // Se for do tipo SHOULD (Quando o usuário digita na barra de pesquisa do Zoom)
                                if (rowValue.toUpperCase().indexOf(initialValue.toUpperCase()) < 0) {
                                    addRow = false;
                                    break;
                                }
                            }
                        }
                    }
                }

                // Só insere no dataset se passar por todos os filtros
                if (addRow) {
                    dataset.addRow(rowData);
                }
            }
        }

    } catch (e) {
        dataset.addColumn("ERRO");
        dataset.addRow([e.toString()]);
        log.error("--- ERRO DATASET COTAS PCD (DS.FLUIG.0004) GED: " + e.toString());
    }

    return dataset;
}

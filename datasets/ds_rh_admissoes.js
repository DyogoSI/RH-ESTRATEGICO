// DS.FLUIG.0005 - Controle Admitidos
// Dados cadastrais, organizacionais e admissionais dos funcionários,
// relacionando pessoa, coligada, filial, seção, função e tabelas de
// descrição do RM (situação, tipo de admissão, motivo, categoria eSocial).
// Colunas do CSV: CODCOLIGADA;CNPJ_COLIGADA;NOME_COLIGADA;CODFILIAL;
// CNPJ_FILIAL;NOME_FILIAL;CHAPA;CODPESSOA;NOME;CPF;DTNASCIMENTO;CODSITUACAO;
// ESTADONATAL;DATAADMISSAO;DESCRICAO_CORRACA;CORRACA;DESCRICAO_GRAU_INSTRUCAO;
// DATADEMISSAO;GRAUINSTRUCAO;DESCRICAO_SEXO;SALARIO;SEXO;
// DESCRICAO_NACIONALIDADE;CODSECAO;NACIONALIDADE;NOME_SECAO;CODFUNCAO;
// NOME_FUNCAO;TIPO_DEFICIENCIA;TIPOADMISSAO;MOTIVOADMISSAO;
// DESCRICAO_TIPO_ADMISSAO;CODTIPO;CODCATEGORIAESOCIAL;
// DESCRICAO_MOTIVO_ADMISSAO;DESCRICAO_CODTIPO;DESCRICAO_CATEGORIA_ESOCIAL
//
// O arquivo original (~5,2 MB) não coube no upload do GED, então foi
// dividido em 6 partes menores (cada uma com o cabeçalho repetido, pra
// poder ser aberta sozinha se precisar). Este dataset baixa as 6 partes
// e junta tudo antes de processar.

function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    try {
        var folderId = 14271; // pasta "RH ESTRATEGICO" no GED
        var adminUser = "guilherme-af";
        var adminPass = "Avwc1920.";

        var nomesPartes = [
            "DS.FLUIG.0005- Controle Admitidos - Parte 1.CSV",
            "DS.FLUIG.0005- Controle Admitidos - Parte 2.CSV",
            "DS.FLUIG.0005- Controle Admitidos - Parte 3.CSV",
            "DS.FLUIG.0005- Controle Admitidos - Parte 4.CSV",
            "DS.FLUIG.0005- Controle Admitidos - Parte 5.CSV",
            "DS.FLUIG.0005- Controle Admitidos - Parte 6.CSV"
        ];

        var todasAsLinhas = [];

        for (var p = 0; p < nomesPartes.length; p++) {
            var textoParte = baixarCsvGed(folderId, nomesPartes[p], adminUser, adminPass);
            var linhasParte = textoParte.split(/\r?\n/);

            // A partir da 2ª parte, descarta a 1ª linha (cabeçalho repetido)
            var inicio = (p === 0) ? 0 : 1;

            for (var li = inicio; li < linhasParte.length; li++) {
                todasAsLinhas.push(linhasParte[li]);
            }
        }

        // --- Processar o CSV combinado e APLICAR OS FILTROS ---
        var isFirstLine = true;
        var colCount = 0;
        var colIndices = {}; // Armazena a posição de cada coluna para usarmos no filtro

        for (var i = 0; i < todasAsLinhas.length; i++) {
            var line = String(todasAsLinhas[i]).trim();

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

                        // Se existir a coluna filtrada no CSV (ex: CODCOLIGADA, CODFILIAL, CHAPA)
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
        log.error("--- ERRO DATASET ADMISSOES (DS.FLUIG.0005) GED: " + e.toString());
    }

    return dataset;
}

function baixarCsvGed(folderId, fileName, adminUser, adminPass) {
    var documentId = null;
    var version = null;
    var companyId = null;
    var physicalFile = null;

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

    var provider = ServiceManager.getService("ECMDocumentService");

    if (provider == null) {
        throw "Serviço 'ECMDocumentService' não cadastrado no Fluig.";
    }

    var locator = provider.instantiate("com.totvs.technology.ecm.dm.ws.ECMDocumentServiceService");
    var service = locator.getDocumentServicePort();

    var jCompanyId = new java.lang.Integer(parseInt(companyId.toString())).intValue();
    var jDocumentId = new java.lang.Integer(parseInt(documentId.toString())).intValue();
    var jVersion = new java.lang.Integer(parseInt(version.toString())).intValue();

    var jUser = new java.lang.String(adminUser);
    var jPass = new java.lang.String(adminPass);
    var jPhysical = new java.lang.String(physicalFile);

    var byteContent = service.getDocumentContent(
        jUser, jPass, jCompanyId, jDocumentId, jUser, jVersion, jPhysical
    );

    if (byteContent == null || byteContent.length === 0) {
        throw "O arquivo '" + fileName + "' foi encontrado, mas seu conteúdo está vazio.";
    }

    var textoJava = new java.lang.String(byteContent, "ISO-8859-1");

    return String(textoJava);
}

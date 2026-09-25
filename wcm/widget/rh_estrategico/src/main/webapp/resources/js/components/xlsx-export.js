var RHXlsxExport = {

    LINHAS_TITULO: 2,

    gerar: function (nomeArquivo, tabelas, botao) {
        if (typeof XLSX === "undefined") {
            console.error("[RH Estratégico] Biblioteca XLSX não carregada.");
            return;
        }

        var textoOriginal = botao ? botao.text() : null;

        if (botao) {
            botao.prop("disabled", true).text("Gerando planilha...");
        }

        try {
            var workbook = XLSX.utils.book_new();
            var nomesUsados = {};

            tabelas.forEach(function (tabela) {
                var planilhaBase;

                if (tabela.colunas && tabela.linhas) {
                    var cabecalho = tabela.colunas.map(function (coluna) {
                        return coluna.rotulo;
                    });

                    var linhas = tabela.linhas.map(function (item) {
                        return tabela.colunas.map(function (coluna) {
                            return item[coluna.campo];
                        });
                    });

                    planilhaBase = XLSX.utils.aoa_to_sheet([cabecalho].concat(linhas));
                } else if (tabela.seletor) {
                    planilhaBase = XLSX.utils.table_to_sheet(tabela.seletor);
                } else {
                    return;
                }

                var planilha = RHXlsxExport.adicionarTitulo(planilhaBase, tabela.titulo);

                RHXlsxExport.estilizarPlanilha(planilha);

                var nomeAba = RHXlsxExport.nomeAbaValido(tabela.titulo, nomesUsados);

                XLSX.utils.book_append_sheet(workbook, planilha, nomeAba);
            });

            XLSX.writeFile(workbook, nomeArquivo + ".xlsx", { cellStyles: true });
        } catch (error) {
            console.error("[RH Estratégico] Erro ao gerar planilha:", error);
        }

        if (botao) {
            botao.prop("disabled", false).text(textoOriginal);
        }
    },

    // Empurra os dados 2 linhas pra baixo e insere um título mesclado
    // (nome da tabela + data de geração), no mesmo espírito do cabeçalho do PDF
    adicionarTitulo: function (planilhaBase, titulo) {
        var intervaloBase = XLSX.utils.decode_range(planilhaBase["!ref"]);
        var deslocamento = this.LINHAS_TITULO;
        var planilha = {};

        Object.keys(planilhaBase).forEach(function (chave) {
            if (chave.charAt(0) === "!") {
                return;
            }

            var celula = XLSX.utils.decode_cell(chave);
            var novoEndereco = XLSX.utils.encode_cell({ r: celula.r + deslocamento, c: celula.c });

            planilha[novoEndereco] = planilhaBase[chave];
        });

        var ultimaColuna = intervaloBase.e.c;

        planilha["A1"] = {
            t: "s",
            v: titulo || "Relatório",
            s: {
                font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
                alignment: { vertical: "center" }
            }
        };

        planilha["A2"] = {
            t: "s",
            v: "RH Estratégico · Gerado em " + new Date().toLocaleString("pt-BR"),
            s: {
                font: { italic: true, sz: 9, color: { rgb: "6B7280" } },
                alignment: { vertical: "center" }
            }
        };

        planilha["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: ultimaColuna } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: ultimaColuna } }
        ];

        planilha["!rows"] = [{ hpt: 24 }, { hpt: 16 }, { hpt: 22 }];

        planilha["!ref"] = XLSX.utils.encode_range({
            s: { r: 0, c: intervaloBase.s.c },
            e: { r: intervaloBase.e.r + deslocamento, c: intervaloBase.e.c }
        });

        return planilha;
    },

    // Cores de fundo por valor de status, pra bater com as cores já usadas
    // nos cards do painel (verde = ok, vermelho = crítico, laranja = atenção)
    CORES_STATUS: {
        "CUMPRIDA": "DCFCE7",
        "ATIVO": "DCFCE7",
        "PARCIALMENTE CUMPRIDA": "FFEDD5",
        "PRESTES A EXPIRAR": "FFEDD5",
        "EM ABERTO": "FFEDD5",
        "NÃO CUMPRIDA": "FEE2E2",
        "EXPIRADO": "FEE2E2",
        "NÃO APLICÁVEL": "F1F5F9",
        "INDETERMINADO": "EDE9FE",
        "ENCERRADO": "F1F5F9"
    },

    BORDA_FINA: { style: "thin", color: { rgb: "E2E8F0" } },
    BORDA_FORTE: { style: "medium", color: { rgb: "2563EB" } },

    // Ajusta a largura de cada coluna pelo maior conteúdo encontrado (pra
    // abrir a planilha já legível, sem precisar redimensionar na mão),
    // destaca o cabeçalho, zebra azulada, cor por status e moldura externa
    estilizarPlanilha: function (planilha) {
        if (!planilha["!ref"]) {
            return;
        }

        var that = this;
        var intervalo = XLSX.utils.decode_range(planilha["!ref"]);
        var linhaCabecalho = this.LINHAS_TITULO;
        var larguras = [];
        var colunaStatus = -1;

        for (var col = intervalo.s.c; col <= intervalo.e.c; col++) {
            var maiorLargura = 8;

            for (var linha = linhaCabecalho; linha <= intervalo.e.r; linha++) {
                var endereco = XLSX.utils.encode_cell({ r: linha, c: col });
                var celula = planilha[endereco];

                if (celula && celula.v !== undefined && celula.v !== null) {
                    var tamanho = String(celula.v).length;

                    if (tamanho > maiorLargura) {
                        maiorLargura = tamanho;
                    }
                }
            }

            larguras.push({ wch: Math.min(maiorLargura + 2, 50) });

            var enderecoTitulo = XLSX.utils.encode_cell({ r: linhaCabecalho, c: col });
            var celulaTitulo = planilha[enderecoTitulo];

            if (celulaTitulo && String(celulaTitulo.v).trim().toUpperCase() === "STATUS") {
                colunaStatus = col;
            }
        }

        planilha["!cols"] = larguras;

        planilha["!autofilter"] = {
            ref: XLSX.utils.encode_range({
                s: { r: linhaCabecalho, c: intervalo.s.c },
                e: { r: intervalo.e.r, c: intervalo.e.c }
            })
        };

        for (var linhaAtual = linhaCabecalho; linhaAtual <= intervalo.e.r; linhaAtual++) {
            var ehCabecalho = linhaAtual === linhaCabecalho;
            var ehPrimeiraLinhaDados = linhaAtual === linhaCabecalho + 1;
            var ehUltimaLinha = linhaAtual === intervalo.e.r;
            var ehLinhaPar = (linhaAtual - linhaCabecalho) % 2 === 0;

            for (var colAtual = intervalo.s.c; colAtual <= intervalo.e.c; colAtual++) {
                var enderecoAtual = XLSX.utils.encode_cell({ r: linhaAtual, c: colAtual });
                var celulaAtual = planilha[enderecoAtual];

                if (!celulaAtual) {
                    continue;
                }

                var ehPrimeiraColuna = colAtual === intervalo.s.c;
                var ehUltimaColuna = colAtual === intervalo.e.c;

                var borda = {
                    top: ehCabecalho || ehPrimeiraLinhaDados ? that.BORDA_FORTE : that.BORDA_FINA,
                    bottom: ehCabecalho || ehUltimaLinha ? that.BORDA_FORTE : that.BORDA_FINA,
                    left: ehPrimeiraColuna ? that.BORDA_FORTE : that.BORDA_FINA,
                    right: ehUltimaColuna ? that.BORDA_FORTE : that.BORDA_FINA
                };

                if (ehCabecalho) {
                    celulaAtual.s = {
                        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
                        fill: { patternType: "solid", fgColor: { rgb: "2563EB" } },
                        alignment: { vertical: "center", horizontal: "left", wrapText: true },
                        border: borda
                    };

                    continue;
                }

                var corFundo = ehLinhaPar ? "FFFFFF" : "EFF6FF";
                var negrito = false;

                if (colAtual === colunaStatus) {
                    var chaveStatus = String(celulaAtual.v || "").trim().toUpperCase();

                    if (that.CORES_STATUS[chaveStatus]) {
                        corFundo = that.CORES_STATUS[chaveStatus];
                        negrito = true;
                    }
                }

                celulaAtual.s = {
                    font: { bold: negrito, sz: 10, color: { rgb: "1F2937" } },
                    fill: { patternType: "solid", fgColor: { rgb: corFundo } },
                    alignment: {
                        vertical: "center",
                        horizontal: celulaAtual.t === "n" ? "right" : "left"
                    },
                    border: borda
                };
            }
        }
    },

    // Nomes de aba no Excel têm limite de 31 caracteres e não podem repetir
    // nem conter : \ / ? * [ ]
    nomeAbaValido: function (titulo, nomesUsados) {
        var nome = String(titulo || "Planilha")
            .replace(/[:\\\/\?\*\[\]]/g, " ")
            .trim()
            .substring(0, 31);

        if (!nome) {
            nome = "Planilha";
        }

        var nomeFinal = nome;
        var contador = 2;

        while (nomesUsados[nomeFinal]) {
            var sufixo = " (" + contador + ")";
            nomeFinal = nome.substring(0, 31 - sufixo.length) + sufixo;
            contador++;
        }

        nomesUsados[nomeFinal] = true;

        return nomeFinal;
    },

    bind: function (botaoSeletor, nomeArquivo, tabelas) {
        var botao = $(botaoSeletor);

        botao
            .off("click.rhXlsxExport")
            .on("click.rhXlsxExport", function () {
                RHXlsxExport.gerar(nomeArquivo, tabelas, botao);
            });
    }

};

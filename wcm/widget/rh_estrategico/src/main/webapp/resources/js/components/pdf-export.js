var RHPdfExport = {

    gerar: function (nomeArquivo, titulo, tabelas, botao) {
        if (typeof window.jspdf === "undefined") {
            console.error("[RH Estratégico] Biblioteca jsPDF não carregada.");
            return;
        }

        var textoOriginal = botao ? botao.text() : null;

        if (botao) {
            botao.prop("disabled", true).text("Gerando PDF...");
        }

        try {
            var doc = new window.jspdf.jsPDF({ orientation: "landscape" });
            var margemEsquerda = 14;
            var y = 15;

            doc.setFontSize(14);
            doc.text(titulo, margemEsquerda, y);
            y += 8;

            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.text("Gerado em " + new Date().toLocaleString("pt-BR"), margemEsquerda, y);
            doc.setTextColor(0);
            y += 6;

            tabelas.forEach(function (tabela, indice) {
                if (indice > 0) {
                    doc.addPage();
                    y = 15;
                }

                doc.setFontSize(12);
                doc.text(tabela.titulo, margemEsquerda, y);

                var opcoes = {
                    startY: y + 4,
                    margin: { left: margemEsquerda, right: margemEsquerda },
                    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
                    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 8 },
                    alternateRowStyles: { fillColor: [245, 247, 250] },
                    theme: "striped"
                };

                if (tabela.colunas && tabela.linhas) {
                    // Conjunto de colunas reduzido definido pela view (tabelas com
                    // muitas colunas na tela não cabem legíveis no PDF)
                    opcoes.head = [tabela.colunas.map(function (coluna) {
                        return coluna.rotulo;
                    })];

                    opcoes.body = tabela.linhas.map(function (item) {
                        return tabela.colunas.map(function (coluna) {
                            return item[coluna.campo];
                        });
                    });
                } else {
                    opcoes.html = tabela.seletor;
                }

                doc.autoTable(opcoes);
            });

            this.adicionarRodape(doc);

            doc.save(nomeArquivo + ".pdf");
        } catch (error) {
            console.error("[RH Estratégico] Erro ao gerar PDF:", error);
        }

        if (botao) {
            botao.prop("disabled", false).text(textoOriginal);
        }
    },

    adicionarRodape: function (doc) {
        if (typeof RH_LOGO_BASE64 === "undefined") {
            return;
        }

        var totalPaginas = doc.internal.getNumberOfPages();
        var larguraLogo = 22;
        var alturaLogo = larguraLogo * (131 / 513);

        for (var pagina = 1; pagina <= totalPaginas; pagina++) {
            doc.setPage(pagina);

            var alturaPagina = doc.internal.pageSize.getHeight();
            var larguraPagina = doc.internal.pageSize.getWidth();

            try {
                doc.addImage(
                    RH_LOGO_BASE64,
                    "PNG",
                    14,
                    alturaPagina - alturaLogo - 6,
                    larguraLogo,
                    alturaLogo
                );
            } catch (error) {
                console.error("[RH Estratégico] Erro ao inserir logo no PDF:", error);
            }

            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                "Página " + pagina + " de " + totalPaginas,
                larguraPagina - 14,
                alturaPagina - 8,
                { align: "right" }
            );
            doc.setTextColor(0);
        }
    },

    bind: function (botaoSeletor, nomeArquivo, titulo, tabelas) {
        var botao = $(botaoSeletor);

        botao
            .off("click.rhPdfExport")
            .on("click.rhPdfExport", function () {
                RHPdfExport.gerar(nomeArquivo, titulo, tabelas, botao);
            });
    }

};

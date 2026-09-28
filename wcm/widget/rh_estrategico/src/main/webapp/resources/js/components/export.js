var RHExport = {

    capturar: function (elementoSeletor, nomeArquivo, botao) {
        var elemento = $(elementoSeletor)[0];

        if (!elemento || typeof html2canvas === "undefined") {
            return;
        }

        var textoOriginal = botao ? botao.text() : null;

        if (botao) {
            botao.prop("disabled", true).text("Gerando imagem...");
        }

        // O fundo colorido (gradiente radial roxo/ciano) é definido no
        // container raiz do widget (".fluig-style-guide.rh-estrategico-widget"),
        // fora do elemento que é capturado aqui — por isso a imagem saía
        // sem nenhum fundo. Em vez de duplicar o gradiente em JS, aplica
        // temporariamente a MESMA classe/atributo de tema no elemento
        // capturado, pra cair na mesma regra CSS (já cobre claro e escuro),
        // e desfaz tudo depois
        var raizTema = elemento.closest(".rh-estrategico-widget");
        var temaEscuro = !!raizTema && raizTema.getAttribute("data-rh-theme") === "dark";

        var classesOriginais = elemento.className;
        var paddingOriginal = elemento.style.padding;
        var temaOriginal = elemento.getAttribute("data-rh-theme");

        elemento.classList.add("fluig-style-guide", "rh-estrategico-widget");
        elemento.style.padding = "20px";

        if (temaEscuro) {
            elemento.setAttribute("data-rh-theme", "dark");
        }

        // A imagem exportada saía sem nenhuma identidade visual da empresa
        // (o cabeçalho com a logo é um elemento separado, fora da área
        // capturada). O PDF já resolve isso desenhando a logo direto no
        // jsPDF (ver pdf-export.js/RH_LOGO_BASE64) — aqui, como é uma
        // captura de tela, insere um cabeçalho de verdade no topo do
        // elemento antes de capturar, e remove depois.
        //
        // A logo "branca" (RH_LOGO_BRANCA_BASE64) tem o texto "INTERHATIVA"
        // bem clarinho — só aparece de verdade em cima de fundo escuro, por
        // isso só usa ela quando o tema escuro está ativo; no claro
        // continua com a logo original (colorida)
        var cabecalho = null;
        var logoParaExportar = temaEscuro && typeof RH_LOGO_BRANCA_BASE64 !== "undefined"
            ? RH_LOGO_BRANCA_BASE64
            : (typeof RH_LOGO_BASE64 !== "undefined" ? RH_LOGO_BASE64 : null);

        if (logoParaExportar) {
            cabecalho = document.createElement("div");

            // Estilo direto no elemento (não só a classe "rh-export-cabecalho"
            // do rh_estrategico.css) — esse cabeçalho só existe durante a
            // captura, então não dá pra confiar que o CSS externo já vai
            // estar carregado/aplicado a tempo do html2canvas capturar
            cabecalho.setAttribute(
                "style",
                "display: flex; align-items: center; gap: 14px; " +
                "margin-bottom: 20px; padding-bottom: 16px; " +
                "border-bottom: 1px solid " + (temaEscuro ? "rgba(255,255,255,0.14)" : "#e9e9f5") + ";"
            );

            cabecalho.innerHTML =
                '<img src="' + logoParaExportar + '" alt="" style="display: block; height: 34px; width: auto; flex: none;">' +
                '<div style="display: flex; flex-direction: column;">' +
                    '<strong style="font-size: 15px; font-weight: 800; color: ' + (temaEscuro ? "#e7e8f5" : "#1e1b4b") + ';">RH Estratégico</strong>' +
                    '<span style="font-size: 11px; color: ' + (temaEscuro ? "#9497b8" : "#6b7280") + ';">Gerado em ' + new Date().toLocaleString("pt-BR") + '</span>' +
                "</div>";

            elemento.insertBefore(cabecalho, elemento.firstChild);
        }

        var restaurarElemento = function () {
            elemento.className = classesOriginais;
            elemento.style.padding = paddingOriginal;

            if (temaOriginal === null) {
                elemento.removeAttribute("data-rh-theme");
            } else {
                elemento.setAttribute("data-rh-theme", temaOriginal);
            }

            if (cabecalho && cabecalho.parentNode) {
                cabecalho.parentNode.removeChild(cabecalho);
            }
        };

        html2canvas(elemento, {
            scale: 2,
            useCORS: true,
            ignoreElements: function (el) {
                return el.classList && el.classList.contains("rh-no-print");
            }
        }).then(function (canvas) {
            restaurarElemento();

            var link = document.createElement("a");

            link.download = (nomeArquivo || "indicadores") + ".png";
            link.href = canvas.toDataURL("image/png");
            link.click();

            if (botao) {
                botao.prop("disabled", false).text(textoOriginal);
            }
        }).catch(function (error) {
            restaurarElemento();

            console.error("[RH Estratégico] Erro ao gerar imagem:", error);

            if (botao) {
                botao.prop("disabled", false).text(textoOriginal);
            }
        });
    },

    bind: function (botaoSeletor, elementoSeletor, nomeArquivo) {
        var botao = $(botaoSeletor);

        botao
            .off("click.rhExport")
            .on("click.rhExport", function () {
                RHExport.capturar(elementoSeletor, nomeArquivo, botao);
            });
    }

};

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

        var restaurarElemento = function () {
            elemento.className = classesOriginais;
            elemento.style.padding = paddingOriginal;

            if (temaOriginal === null) {
                elemento.removeAttribute("data-rh-theme");
            } else {
                elemento.setAttribute("data-rh-theme", temaOriginal);
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

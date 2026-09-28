// Carrossel simples e genérico: gira sozinho entre os ".rh-carousel-slide"
// de dentro do seletor passado, troca de bolinha (".rh-carousel-dot") junto,
// e reinicia a animação de "efeito" (classe "rh-carousel-efeito") a cada
// troca. Usado hoje só na Visão Geral, mas não depende de nada específico
// dela — dá pra reaproveitar em qualquer outro carrossel de cartões
var RHCarousel = {

    INTERVALO_MS: 7000,

    instancias: {},

    init: function (seletor) {
        var $carrossel = $(seletor);

        if (!$carrossel.length) {
            return;
        }

        // Se já existia um carrossel rodando nesse mesmo seletor (ex.: a
        // Visão Geral foi recarregada), para o timer antigo antes de criar
        // outro, senão ficam dois rodando ao mesmo tempo
        if (this.instancias[seletor]) {
            clearInterval(this.instancias[seletor]);
        }

        var $slides = $carrossel.find(".rh-carousel-slide");
        var $dots = $carrossel.find(".rh-carousel-dot");

        if ($slides.length < 2) {
            return;
        }

        var indiceAtual = $slides.filter(".active").length
            ? $slides.index($slides.filter(".active").first())
            : 0;

        var irPara = function (indice) {
            if (indice === indiceAtual) {
                return;
            }

            $slides.eq(indiceAtual).removeClass("active rh-carousel-efeito");
            $dots.eq(indiceAtual).removeClass("active");

            indiceAtual = indice;

            var $novoSlide = $slides.eq(indiceAtual);

            $novoSlide.addClass("active");
            $dots.eq(indiceAtual).addClass("active");

            // Força o navegador a "esquecer" que a classe já foi aplicada
            // antes, senão reaplicar "rh-carousel-efeito" no mesmo slide
            // (ex.: voltando pro slide 0 depois de já ter passado por ele)
            // não reinicia a animação CSS
            void $novoSlide[0].offsetWidth;

            $novoSlide.addClass("rh-carousel-efeito");
        };

        var proximo = function () {
            irPara((indiceAtual + 1) % $slides.length);
        };

        var timer = setInterval(proximo, this.INTERVALO_MS);

        this.instancias[seletor] = timer;

        $dots.off("click.rhCarousel").on("click.rhCarousel", function () {
            irPara($dots.index(this));

            clearInterval(timer);
            timer = setInterval(proximo, RHCarousel.INTERVALO_MS);
            RHCarousel.instancias[seletor] = timer;
        });

        // Pausa enquanto o mouse está em cima, pra dar tempo de olhar o
        // gráfico com calma, e volta a girar quando a pessoa tira o mouse
        $carrossel.off("mouseenter.rhCarousel").on("mouseenter.rhCarousel", function () {
            clearInterval(timer);
        });

        $carrossel.off("mouseleave.rhCarousel").on("mouseleave.rhCarousel", function () {
            clearInterval(timer);
            timer = setInterval(proximo, RHCarousel.INTERVALO_MS);
            RHCarousel.instancias[seletor] = timer;
        });
    }

};

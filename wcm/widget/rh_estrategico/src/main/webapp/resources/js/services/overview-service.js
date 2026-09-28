// Antes este serviço só lia o dataset "ds_rh_mock_overview" (6 meses de
// números inventados no código, sem nenhuma ligação com os dados reais).
// Agora agrega os mesmos 3 datasets reais usados pelas outras abas
// (admissões/rescisões e headcount saem de "ds_rh_admissoes", que carrega
// DATAADMISSAO e DATADEMISSAO por colaborador; afastamentos de
// "ds_rh_afastamentos"; férias de "ds_rh_ferias_marcadas"), mês a mês.
var RHOverviewService = {

    MESES_PT: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    JANELA_PADRAO_MESES: 6,
    LIMITE_MESES: 24,

    buscar: function (filtros) {
        var that = this;
        var meses = this.gerarMeses(filtros);

        var admissoes = RHDatasetService.buscar("ds_rh_admissoes", this.constraintsAdmissoes(filtros));
        var afastamentos = RHDatasetService.buscar("ds_rh_afastamentos", this.constraintsAfastamentos(filtros));
        var feriasMarcadas = RHDatasetService.buscar("ds_rh_ferias_marcadas", this.constraintsFerias(filtros));

        return meses.map(function (mes) {
            return {
                DATA: mes.chave,
                MES: mes.label,
                HEADCOUNT: that.headcountNoMes(admissoes, mes.fim),
                ADMISSOES: that.contarEventoNoMes(admissoes, "DATAADMISSAO", mes),
                RESCISOES: that.contarEventoNoMes(admissoes, "DATADEMISSAO", mes),
                AFASTAMENTOS: that.afastamentosNoMes(afastamentos, mes.fim),
                FERIAS: that.feriasNoMes(feriasMarcadas, mes)
            };
        });
    },

    constraintsAdmissoes: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(RHDatasetService.criarConstraint("CODCOLIGADA", filtros.empresa));
        }

        if (filtros.filial) {
            constraints.push(RHDatasetService.criarConstraint("CODFILIAL", filtros.filial));
        }

        return constraints;
    },

    // Dataset de afastamentos usa "COLIGADA"/"FILIAL" (sem "COD" na frente),
    // diferente do de admissões
    constraintsAfastamentos: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(RHDatasetService.criarConstraint("COLIGADA", filtros.empresa));
        }

        if (filtros.filial) {
            constraints.push(RHDatasetService.criarConstraint("FILIAL", filtros.filial));
        }

        return constraints;
    },

    // "ds_rh_ferias_marcadas" não tem coluna de filial
    constraintsFerias: function (filtros) {
        var constraints = [];

        if (filtros.empresa) {
            constraints.push(RHDatasetService.criarConstraint("CODCOLIGADA", filtros.empresa));
        }

        return constraints;
    },

    pad2: function (numero) {
        return numero < 10 ? "0" + numero : String(numero);
    },

    // O <input type="date"> manda "AAAA-MM-DD". "new Date('AAAA-MM-DD')"
    // interpreta isso como meia-noite UTC, e em fuso negativo (Brasil)
    // getFullYear()/getMonth() em cima disso "volta" um dia — virando até
    // o MÊS errado quando cai no dia 1. Monta a data no fuso local direto
    parseDataFiltro: function (valor) {
        var partes = String(valor).split("-");

        return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    },

    // Monta a lista de meses a exibir a partir do filtro de período (mês do
    // "dataInicio" até o mês do "dataFim"). Sem filtro, mostra os últimos 6
    // meses terminando no mês atual — mesma janela que o mock antigo usava.
    // Limita o total de meses pra não gerar uma janela gigante por engano
    gerarMeses: function (filtros) {
        var hoje = new Date();
        var fimJanela = filtros.dataFim ? this.parseDataFiltro(filtros.dataFim) : hoje;
        var inicioJanela = filtros.dataInicio
            ? this.parseDataFiltro(filtros.dataInicio)
            : new Date(fimJanela.getFullYear(), fimJanela.getMonth() - (this.JANELA_PADRAO_MESES - 1), 1);

        var cursor = new Date(inicioJanela.getFullYear(), inicioJanela.getMonth(), 1);
        var limite = new Date(fimJanela.getFullYear(), fimJanela.getMonth(), 1);

        if (cursor > limite) {
            var troca = cursor;
            cursor = limite;
            limite = troca;
        }

        var minimoPermitido = new Date(limite.getFullYear(), limite.getMonth() - (this.LIMITE_MESES - 1), 1);

        if (cursor < minimoPermitido) {
            cursor = minimoPermitido;
        }

        var meses = [];

        while (cursor <= limite) {
            var inicioMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
            var fimMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);

            meses.push({
                chave: cursor.getFullYear() + "-" + this.pad2(cursor.getMonth() + 1) + "-01",
                label: this.MESES_PT[cursor.getMonth()],
                inicio: inicioMes,
                fim: fimMes
            });

            cursor.setMonth(cursor.getMonth() + 1);
        }

        return meses;
    },

    // Conta quantos registros têm o campo de data (DATAADMISSAO ou
    // DATADEMISSAO) dentro do mês
    contarEventoNoMes: function (registros, campoData, mes) {
        var total = 0;

        for (var i = 0; i < registros.length; i++) {
            var data = RHAdmissionService.parseData(registros[i][campoData]);

            if (data && data >= mes.inicio && data <= mes.fim) {
                total++;
            }
        }

        return total;
    },

    // Snapshot de headcount no fim do mês: admitidos até lá e ainda sem
    // desligamento até essa data (ou sem desligamento registrado)
    headcountNoMes: function (registros, fimMes) {
        var total = 0;

        for (var i = 0; i < registros.length; i++) {
            var admissao = RHAdmissionService.parseData(registros[i].DATAADMISSAO);

            if (!admissao || admissao > fimMes) {
                continue;
            }

            var demissao = RHAdmissionService.parseData(registros[i].DATADEMISSAO);

            if (demissao && demissao <= fimMes) {
                continue;
            }

            total++;
        }

        return total;
    },

    // Afastamentos ainda em aberto no fim do mês (sem retorno, ou retorno
    // depois do fim do mês) — mesma ideia de "Em andamento" usada na aba
    // Afastamentos
    afastamentosNoMes: function (registros, fimMes) {
        var total = 0;

        for (var i = 0; i < registros.length; i++) {
            var inicio = RHLeaveService.parseData(registros[i]["INICIO DO AFASTAMENTO"]);

            if (!inicio || inicio > fimMes) {
                continue;
            }

            var fim = RHLeaveService.parseData(registros[i]["FIM DO AFASTAMENTO"]);

            if (fim && fim <= fimMes) {
                continue;
            }

            total++;
        }

        return total;
    },

    // Férias marcadas que cruzam o mês (começaram antes/durante e
    // terminam durante/depois dele)
    feriasNoMes: function (registros, mes) {
        var total = 0;

        for (var i = 0; i < registros.length; i++) {
            var inicio = RHVacationService.parseData(registros[i].DATAINICIO);
            var fim = RHVacationService.parseData(registros[i].DATAFIM);

            if (!inicio || !fim) {
                continue;
            }

            if (fim < mes.inicio || inicio > mes.fim) {
                continue;
            }

            total++;
        }

        return total;
    }

};

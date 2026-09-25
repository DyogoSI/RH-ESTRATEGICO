var RHKpiCards = {

    render: function (instanceId, dados) {
        $("#rhKpiHeadcount_" + instanceId).text(dados.headcount);
        $("#rhKpiAdmissoes_" + instanceId).text(dados.admissoes);
        $("#rhKpiRescisoes_" + instanceId).text(dados.rescisoes);
        $("#rhKpiAfastamentos_" + instanceId).text(dados.afastamentos);
        $("#rhKpiFerias_" + instanceId).text(dados.ferias);
    }

};
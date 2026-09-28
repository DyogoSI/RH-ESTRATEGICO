var RHFilterService = {

    empresas: null,
    filiais: null,

    // As opções de empresa/filial dos filtros vinham de datasets mock
    // (dois códigos fixos "1"/"2" que não existem nos dados reais) —
    // selecionar qualquer uma delas fazia os outros datasets (que usam os
    // códigos REAIS de coligada/filial dos CSVs do GED) não encontrar nada.
    // Agora a lista é derivada dos cadastros de cotas (ds_rh_cotas_pcd e
    // ds_rh_cotas_aprendiz), que já trazem código + nome de coligada e
    // filial e são bem mais leves que os CSVs de admissão/contrato
    carregarCadastro: function () {
        if (this.empresas && this.filiais) {
            return;
        }

        var registros = RHDatasetService.buscar("ds_rh_cotas_pcd", [])
            .concat(RHDatasetService.buscar("ds_rh_cotas_aprendiz", []));

        var empresasPorCodigo = {};
        var filiaisPorChave = {};

        registros.forEach(function (item) {
            var codEmpresa = item.CODCOLIGADA;
            var codFilial = item.CODFILIAL;

            if (codEmpresa && !empresasPorCodigo[codEmpresa]) {
                empresasPorCodigo[codEmpresa] = {
                    COD_EMPRESA: codEmpresa,
                    EMPRESA: item.NOME_COLIGADA || codEmpresa
                };
            }

            if (codEmpresa && codFilial) {
                var chave = codEmpresa + "_" + codFilial;

                if (!filiaisPorChave[chave]) {
                    filiaisPorChave[chave] = {
                        COD_EMPRESA: codEmpresa,
                        COD_FILIAL: codFilial,
                        FILIAL: item.NOME_FILIAL || codFilial
                    };
                }
            }
        });

        this.empresas = Object.keys(empresasPorCodigo)
            .map(function (codigo) {
                return empresasPorCodigo[codigo];
            })
            .sort(function (a, b) {
                return String(a.EMPRESA).localeCompare(String(b.EMPRESA));
            });

        this.filiais = Object.keys(filiaisPorChave)
            .map(function (chave) {
                return filiaisPorChave[chave];
            })
            .sort(function (a, b) {
                return String(a.FILIAL).localeCompare(String(b.FILIAL));
            });
    },

    buscarEmpresas: function () {
        this.carregarCadastro();

        return this.empresas || [];
    },

    buscarFiliais: function (empresa) {
        this.carregarCadastro();

        var filiais = this.filiais || [];

        if (!empresa) {
            return filiais;
        }

        return filiais.filter(function (item) {
            return String(item.COD_EMPRESA) === String(empresa);
        });
    }

};
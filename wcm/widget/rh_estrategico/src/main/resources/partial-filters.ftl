<aside class="rh-filters">

    <h3 class="rh-filters-titulo">Filtros</h3>

    <div class="rh-filters-corpo">

    <div class="rh-filter-group">
        <label for="rhDataInicio_${instanceId}">De</label>
        <input
            type="date"
            id="rhDataInicio_${instanceId}"
            class="rh-filter-control">
    </div>

    <div class="rh-filter-group">
        <label for="rhDataFim_${instanceId}">Até</label>
        <input
            type="date"
            id="rhDataFim_${instanceId}"
            class="rh-filter-control">
    </div>

    <div class="rh-filter-group">
        <label for="rhEmpresa_${instanceId}">Empresa</label>
        <select id="rhEmpresa_${instanceId}" class="rh-filter-control">
            <option value="">Todas</option>
        </select>
    </div>

    <div class="rh-filter-group">
        <label for="rhFilial_${instanceId}">Filial</label>
        <select id="rhFilial_${instanceId}" class="rh-filter-control">
            <option value="">Todas</option>
        </select>
    </div>

    <#-- Só aparece na aba Férias (ver "rh-filter-group--secao" em filters.css) -->
    <div class="rh-filter-group rh-filter-group--secao">
        <label for="rhVacationSecao_${instanceId}">Seção</label>
        <select id="rhVacationSecao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as seções</option>
        </select>
    </div>

    <#-- Só aparece na aba Contratos (ver "rh-filter-group--contrato" em filters.css) -->
    <div class="rh-filter-group rh-filter-group--contrato">
        <label for="rhContractStatus_${instanceId}">Status</label>
        <select id="rhContractStatus_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
            <option value="Ativo">Ativo</option>
            <option value="Prestes a Expirar">Prestes a Expirar</option>
            <option value="Expirado">Expirado</option>
            <option value="Indeterminado">Indeterminado</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--contrato">
        <label for="rhContractTipo_${instanceId}">Tipo de Contrato</label>
        <select id="rhContractTipo_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
            <option value="Indeterminado">Indeterminado</option>
            <option value="Prazo Determinado">Prazo Determinado</option>
            <option value="Experiência">Experiência</option>
            <option value="Estágio">Estágio</option>
            <option value="Aprendiz">Aprendiz</option>
            <option value="Não informado">Não informado</option>
        </select>
    </div>

    <#-- Só aparecem na aba Admissões (ver "rh-filter-group--admission" em
         filters.css). As opções de cada select são preenchidas pelo
         admission-view.js a partir dos próprios dados carregados -->
    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionSecao_${instanceId}">Seção</label>
        <select id="rhAdmissionSecao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as seções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionFuncao_${instanceId}">Função</label>
        <select id="rhAdmissionFuncao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as funções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionSituacao_${instanceId}">Situação</label>
        <select id="rhAdmissionSituacao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as situações</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionTipoAdmissao_${instanceId}">Tipo de Admissão</label>
        <select id="rhAdmissionTipoAdmissao_${instanceId}" class="rh-filter-control">
            <option value="">Todos os tipos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionMotivo_${instanceId}">Motivo da Admissão</label>
        <select id="rhAdmissionMotivo_${instanceId}" class="rh-filter-control">
            <option value="">Todos os motivos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionCategoriaEsocial_${instanceId}">Categoria eSocial</label>
        <select id="rhAdmissionCategoriaEsocial_${instanceId}" class="rh-filter-control">
            <option value="">Todas as categorias</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionSexo_${instanceId}">Sexo</label>
        <select id="rhAdmissionSexo_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionNacionalidade_${instanceId}">Nacionalidade</label>
        <select id="rhAdmissionNacionalidade_${instanceId}" class="rh-filter-control">
            <option value="">Todas</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionRaca_${instanceId}">Raça/Cor</label>
        <select id="rhAdmissionRaca_${instanceId}" class="rh-filter-control">
            <option value="">Todas</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionGrauInstrucao_${instanceId}">Grau de Instrução</label>
        <select id="rhAdmissionGrauInstrucao_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--admission">
        <label for="rhAdmissionDeficiencia_${instanceId}">Tipo de Deficiência</label>
        <select id="rhAdmissionDeficiencia_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
        </select>
    </div>

    <#-- Só aparecem na aba Afastamentos (ver "rh-filter-group--leave" em
         filters.css). As opções são preenchidas pelo leave-view.js a partir
         dos próprios dados carregados -->
    <div class="rh-filter-group rh-filter-group--leave">
        <label for="rhLeaveSecao_${instanceId}">Área</label>
        <select id="rhLeaveSecao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as áreas</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--leave">
        <label for="rhLeaveTipoAfastamento_${instanceId}">Tipo</label>
        <select id="rhLeaveTipoAfastamento_${instanceId}" class="rh-filter-control">
            <option value="">Todos os tipos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--leave">
        <label for="rhLeaveMotivo_${instanceId}">Motivo</label>
        <select id="rhLeaveMotivo_${instanceId}" class="rh-filter-control">
            <option value="">Todos os motivos</option>
        </select>
    </div>

    <#-- Só aparecem na aba Rescisões (ver "rh-filter-group--termination" em
         filters.css). As opções são preenchidas pelo termination-view.js a
         partir dos próprios dados carregados -->
    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationSecao_${instanceId}">Seção</label>
        <select id="rhTerminationSecao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as seções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationFuncao_${instanceId}">Função</label>
        <select id="rhTerminationFuncao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as funções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationCentroCusto_${instanceId}">Centro de Custo</label>
        <select id="rhTerminationCentroCusto_${instanceId}" class="rh-filter-control">
            <option value="">Todos os centros de custo</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationMotivo_${instanceId}">Motivo</label>
        <select id="rhTerminationMotivo_${instanceId}" class="rh-filter-control">
            <option value="">Todos os motivos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationTipo_${instanceId}">Tipo de Demissão</label>
        <select id="rhTerminationTipo_${instanceId}" class="rh-filter-control">
            <option value="">Todos os tipos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationAvisoPrevio_${instanceId}">Aviso Prévio</label>
        <select id="rhTerminationAvisoPrevio_${instanceId}" class="rh-filter-control">
            <option value="">Todos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationFaixaTempo_${instanceId}">Tempo de Empresa</label>
        <select id="rhTerminationFaixaTempo_${instanceId}" class="rh-filter-control">
            <option value="">Todas as faixas</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--termination">
        <label for="rhTerminationFaixaEtaria_${instanceId}">Faixa Etária</label>
        <select id="rhTerminationFaixaEtaria_${instanceId}" class="rh-filter-control">
            <option value="">Todas as faixas</option>
        </select>
    </div>

    <#-- Só aparecem na aba Benefícios (ver "rh-filter-group--benefit" em
         filters.css). As opções são preenchidas pelo benefit-view.js: seção,
         função e período da folha a partir dos dados carregados; "Possui o
         benefício" a partir do catálogo de eventos do benefit-service.js -->
    <div class="rh-filter-group rh-filter-group--benefit">
        <label for="rhBenefitSecao_${instanceId}">Seção</label>
        <select id="rhBenefitSecao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as seções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--benefit">
        <label for="rhBenefitFuncao_${instanceId}">Função</label>
        <select id="rhBenefitFuncao_${instanceId}" class="rh-filter-control">
            <option value="">Todas as funções</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--benefit">
        <label for="rhBenefitPeriodoFolha_${instanceId}">Período da Folha</label>
        <select id="rhBenefitPeriodoFolha_${instanceId}" class="rh-filter-control">
            <option value="">Todos os períodos</option>
        </select>
    </div>

    <div class="rh-filter-group rh-filter-group--benefit">
        <label for="rhBenefitBeneficio_${instanceId}">Possui o Benefício</label>
        <select id="rhBenefitBeneficio_${instanceId}" class="rh-filter-control">
            <option value="">Todos os benefícios</option>
        </select>
    </div>
    </div>

    <div class="rh-filter-actions">
        <button
            type="button"
            id="rhBtnFiltrar_${instanceId}"
            class="rh-btn rh-btn-primary">
            Filtrar
        </button>
        <button
            type="button"
            id="rhBtnLimparFiltros_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Limpar filtros
        </button>
    </div>

</aside>
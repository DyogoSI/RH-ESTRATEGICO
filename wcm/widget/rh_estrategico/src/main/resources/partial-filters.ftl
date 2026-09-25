<section class="rh-filters">

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

    <div class="rh-filter-actions">
        <button
            type="button"
            id="rhBtnLimparFiltros_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Limpar filtros
        </button>
    </div>

</section>
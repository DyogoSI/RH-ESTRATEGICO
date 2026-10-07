<section id="rhOverview_${instanceId}" class="rh-overview">
  <div id="rhOverviewCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Visão Geral</h2>
            <p>Principais indicadores do RH</p>
        </div>
        <button
            type="button"
            id="rhOverviewExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>
    <div class="rh-kpi-grid">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="headcount" title="Clique para ver a evolução mensal">
            <span class="rh-kpi-label">Headcount</span>
            <strong id="rhKpiHeadcount_${instanceId}" class="rh-kpi-value">-</strong>
            <small class="rh-kpi-description">Colaboradores ativos</small>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="admissoes" title="Clique para ver a evolução mensal">
            <span class="rh-kpi-label">Admissões</span>
            <strong id="rhKpiAdmissoes_${instanceId}" class="rh-kpi-value">-</strong>
            <small class="rh-kpi-description">No período</small>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="rescisoes" title="Clique para ver a evolução mensal">
            <span class="rh-kpi-label">Rescisões</span>
            <strong id="rhKpiRescisoes_${instanceId}" class="rh-kpi-value">-</strong>
            <small class="rh-kpi-description">No período</small>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="afastamentos" title="Clique para ver a evolução mensal">
            <span class="rh-kpi-label">Afastamentos</span>
            <strong id="rhKpiAfastamentos_${instanceId}" class="rh-kpi-value">-</strong>
            <small class="rh-kpi-description">Em andamento</small>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="ferias" title="Clique para ver a evolução mensal">
            <span class="rh-kpi-label">Férias</span>
            <strong id="rhKpiFerias_${instanceId}" class="rh-kpi-value">-</strong>
            <small class="rh-kpi-description">No período</small>
        </div>
    </div>

    <div id="rhOverviewDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-carousel" id="rhOverviewCarrossel_${instanceId}">
        <div class="rh-carousel-track">
            <div class="rh-carousel-slide active">
                <div class="rh-chart-card rh-light">
                    <div class="rh-chart-header">
                        <div>
                            <h3>Movimentação de Colaboradores</h3>
                            <span>Admissões x Rescisões</span>
                        </div>
                    </div>
                    <div class="rh-chart-body">
                        <canvas id="rhChartMovimentacao_${instanceId}"></canvas>
                    </div>
                </div>
            </div>
            <div class="rh-carousel-slide">
                <div class="rh-chart-card rh-light">
                    <div class="rh-chart-header">
                        <div>
                            <h3>Distribuição do Quadro</h3>
                            <span>Por situação atual</span>
                        </div>
                    </div>
                    <div class="rh-chart-body rh-chart-body--donut">
                        <canvas id="rhChartDistribuicao_${instanceId}"></canvas>
                    </div>
                </div>
            </div>
        </div>
        <div class="rh-carousel-dots rh-no-print">
            <button type="button" class="rh-carousel-dot active" aria-label="Ver Movimentação de Colaboradores"></button>
            <button type="button" class="rh-carousel-dot" aria-label="Ver Distribuição do Quadro"></button>
        </div>
    </div>
  </div>
</section>
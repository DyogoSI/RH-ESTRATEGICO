<section id="rhContract_${instanceId}" class="rh-contract">
  <div id="rhContractCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Contratos</h2>
            <p>Contratos com prazo determinado (experiência, estágio, aprendiz) e visão dos indeterminados</p>
        </div>
        <button
            type="button"
            id="rhContractExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>

    <div class="rh-kpi-grid rh-contract-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="ativos" title="Clique para ver os contratos">
            <span class="rh-kpi-label">Determinados Ativos</span>
            <strong id="rhContractAtivos_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Experiência, estágio e aprendiz</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="expirando" title="Clique para ver os contratos">
            <span class="rh-kpi-label">Prestes a Expirar</span>
            <strong id="rhContractExpirando_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Vencimento em até 30 dias</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="expirados" title="Clique para ver os contratos">
            <span class="rh-kpi-label">Expirados</span>
            <strong id="rhContractExpirados_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Prazo encerrado</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="indeterminados" title="Clique para ver os contratos">
            <span class="rh-kpi-label">Indeterminados</span>
            <strong id="rhContractIndeterminados_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Sem prazo definido</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="permanenciaMedia" title="Clique para ver os contratos">
            <span class="rh-kpi-label">Permanência Média</span>
            <strong id="rhContractPermanenciaMedia_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Dias nos contratos determinados</span>
        </div>
    </div>

    <div id="rhContractDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Status dos Contratos</h3>
                    <span>Ativo, prestes a expirar e expirado</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhContractChartStatus_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Contratos por Tipo</h3>
                    <span>Experiência, estágio, aprendiz e indeterminado</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhContractChartTipo_${instanceId}"></canvas>
            </div>
        </div>
    </div>
  </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhContractGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhContractGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Próximos Vencimentos</h3>
                    <span>Contratos determinados mais próximos do término</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Cargo</th>
                        <th>Tipo</th>
                        <th>Término</th>
                        <th>Dias Restantes</th>
                    </tr>
                </thead>
                <tbody id="rhContractTabelaVencimentos_${instanceId}"></tbody>
            </table>
        </div>
    </div>
</section>

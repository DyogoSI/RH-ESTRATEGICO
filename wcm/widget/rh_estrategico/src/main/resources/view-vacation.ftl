<section id="rhVacation_${instanceId}" class="rh-vacation">
    <div id="rhVacationCaptura_${instanceId}">
        <div class="rh-section-header">
            <div>
                <h2>Férias</h2>
                <p>Saldo, vencimentos e programação de férias</p>
            </div>
            <button
                type="button"
                id="rhVacationExportar_${instanceId}"
                class="rh-btn rh-btn-secondary rh-no-print">
                Exportar Imagem
            </button>
        </div>

        <div class="rh-kpi-grid rh-vacation-kpis">
            <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="total" title="Clique para ver os colaboradores">
                <span class="rh-kpi-label">Colaboradores com Saldo</span>
                <strong id="rhVacationTotal_${instanceId}" class="rh-kpi-value">0</strong>
                <span class="rh-kpi-description">Períodos aquisitivos ativos</span>
            </div>
            <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="saldoMedio" title="Clique para ver os colaboradores">
                <span class="rh-kpi-label">Saldo Médio</span>
                <strong id="rhVacationSaldoMedio_${instanceId}" class="rh-kpi-value">0</strong>
                <span class="rh-kpi-description">Dias por colaborador</span>
            </div>
            <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="vencendo" title="Clique para ver os colaboradores">
                <span class="rh-kpi-label">Vencendo em 30 dias</span>
                <strong id="rhVacationVencendo_${instanceId}" class="rh-kpi-value">0</strong>
                <span class="rh-kpi-description">Colaboradores em risco de vencimento</span>
            </div>
            <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="agora" title="Clique para ver os colaboradores">
                <span class="rh-kpi-label">De Férias Agora</span>
                <strong id="rhVacationAgora_${instanceId}" class="rh-kpi-value">0</strong>
                <span class="rh-kpi-description">Colaboradores ausentes hoje</span>
            </div>
        </div>

        <div id="rhVacationDrilldown_${instanceId}" class="rh-drilldown"></div>

        <div class="rh-chart-grid">
            <div class="rh-chart-card">
                <div class="rh-chart-header">
                    <div>
                        <h3>Saldo de Férias por Seção</h3>
                        <span>Top seções com mais dias acumulados</span>
                    </div>
                </div>
                <div class="rh-chart-body">
                    <canvas id="rhVacationChartSecao_${instanceId}"></canvas>
                </div>
            </div>
            <div class="rh-chart-card">
                <div class="rh-chart-header">
                    <div>
                        <h3>Situação das Férias Marcadas</h3>
                        <span>Distribuição por status</span>
                    </div>
                </div>
                <div class="rh-chart-body rh-chart-body--donut">
                    <canvas id="rhVacationChartSituacao_${instanceId}"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhVacationGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhVacationGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid">
        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Próximos Vencimentos</h3>
                    <span>Colaboradores mais próximos do limite (30 dias)</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Seção</th>
                        <th>Saldo</th>
                        <th>Vencimento</th>
                    </tr>
                </thead>
                <tbody id="rhVacationTabelaVencimentos_${instanceId}"></tbody>
            </table>
        </div>

        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>De Férias Agora</h3>
                    <span>Colaboradores ausentes no período atual</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Seção</th>
                        <th>Início</th>
                        <th>Fim</th>
                    </tr>
                </thead>
                <tbody id="rhVacationTabelaAgora_${instanceId}"></tbody>
            </table>
        </div>
    </div>
</section>

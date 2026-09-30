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
            <div
                class="rh-kpi-card rh-vacation-kpi-card rh-vacation-kpi-card--saldo"
                data-rh-kpi="total">
                <div class="rh-vacation-kpi-heading">
                    <span class="rh-vacation-kpi-badge">Saldo</span>
                    <span class="rh-vacation-kpi-action" aria-hidden="true">↗</span>
                </div>
                <span class="rh-kpi-label">Saldo Total</span>
                <div class="rh-vacation-kpi-value-row">
                    <strong
                        id="rhVacationTotal_${instanceId}"
                        class="rh-kpi-value">0</strong>
                    <span>dias</span>
                </div>
                <span class="rh-kpi-description">
                    <strong id="rhVacationTotalColaboradores_${instanceId}">0</strong>
                    colaboradores com saldo
                </span>
                <div class="rh-vacation-kpi-hover">
                    <div class="rh-vacation-kpi-hover-title">
                        Composição do saldo
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Colaboradores</span>
                        <strong id="rhVacationHoverColaboradores_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Períodos aquisitivos</span>
                        <strong id="rhVacationHoverPeriodos_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Dias já gozados</span>
                        <strong id="rhVacationHoverGozados_${instanceId}">0</strong>
                    </div>
                    <span class="rh-vacation-kpi-hover-footer">
                        Clique para detalhar
                    </span>
                </div>
            </div>
            <div
                class="rh-kpi-card rh-vacation-kpi-card rh-vacation-kpi-card--media"
                data-rh-kpi="saldoMedio">
                <div class="rh-vacation-kpi-heading">
                    <span class="rh-vacation-kpi-badge">Média</span>
                    <span class="rh-vacation-kpi-action" aria-hidden="true">↗</span>
                </div>
                <span class="rh-kpi-label">Saldo Médio</span>
                <div class="rh-vacation-kpi-value-row">
                    <strong
                        id="rhVacationSaldoMedio_${instanceId}"
                        class="rh-kpi-value">0</strong>
                    <span>dias</span>
                </div>
                <span class="rh-kpi-description">
                    Média por colaborador
                </span>
                <div class="rh-vacation-kpi-hover">
                    <div class="rh-vacation-kpi-hover-title">
                        Contexto da média
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Saldo total</span>
                        <strong id="rhVacationHoverSaldoTotal_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Colaboradores</span>
                        <strong id="rhVacationHoverMediaColaboradores_${instanceId}">0</strong>
                    </div>
                    <span class="rh-vacation-kpi-hover-footer">
                        Clique para detalhar
                    </span>
                </div>
            </div>
            <div
                class="rh-kpi-card rh-vacation-kpi-card rh-vacation-kpi-card--risco"
                data-rh-kpi="vencendo">
                <div class="rh-vacation-kpi-heading">
                    <span class="rh-vacation-kpi-badge">Atenção</span>
                    <span class="rh-vacation-kpi-action" aria-hidden="true">↗</span>
                </div>
                <span class="rh-kpi-label">Vencendo em 30 dias</span>
                <div class="rh-vacation-kpi-value-row">
                    <strong
                        id="rhVacationVencendo_${instanceId}"
                        class="rh-kpi-value">0</strong>
                    <span>pessoas</span>
                </div>
                <span class="rh-kpi-description">
                    Colaboradores em risco de vencimento
                </span>
                <div class="rh-vacation-kpi-hover">
                    <div class="rh-vacation-kpi-hover-title">
                        Faixa de risco
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Até 7 dias</span>
                        <strong id="rhVacationVencendo7_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>8 a 15 dias</span>
                        <strong id="rhVacationVencendo15_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>16 a 30 dias</span>
                        <strong id="rhVacationVencendo30_${instanceId}">0</strong>
                    </div>
                    <span class="rh-vacation-kpi-hover-footer">
                        Clique para ver colaboradores
                    </span>
                </div>
            </div>
            <div
                class="rh-kpi-card rh-vacation-kpi-card rh-vacation-kpi-card--agora"
                data-rh-kpi="agora">
                <div class="rh-vacation-kpi-heading">
                    <span class="rh-vacation-kpi-badge">Agora</span>
                    <span class="rh-vacation-kpi-action" aria-hidden="true">↗</span>
                </div>
                <span class="rh-kpi-label">De Férias Agora</span>
                <div class="rh-vacation-kpi-value-row">
                    <strong
                        id="rhVacationAgora_${instanceId}"
                        class="rh-kpi-value">0</strong>
                    <span>pessoas</span>
                </div>
                <span class="rh-kpi-description">
                    Colaboradores ausentes hoje
                </span>
                <div class="rh-vacation-kpi-hover">
                    <div class="rh-vacation-kpi-hover-title">
                        Próximos 30 dias
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Férias programadas</span>
                        <strong id="rhVacationProgramadas30_${instanceId}">0</strong>
                    </div>
                    <div class="rh-vacation-kpi-hover-row">
                        <span>Dias programados</span>
                        <strong id="rhVacationDiasProgramados30_${instanceId}">0</strong>
                    </div>
                    <span class="rh-vacation-kpi-hover-footer">
                        Clique para ver ausentes
                    </span>
                </div>
            </div>
        </div>
        <div id="rhVacationDrilldown_${instanceId}" class="rh-drilldown"></div>
        <div class="rh-chart-grid">
            <div class="rh-chart-card rh-vacation-chart-card">
                <div class="rh-chart-header">
                    <div>
                        <span class="rh-vacation-chart-eyebrow">
                            Distribuição por área
                        </span>
                        <h3>Saldo × Dias Gozados por Seção</h3>
                        <span>
                            Compare o saldo disponível com os dias já utilizados
                        </span>
                    </div>
                    <div class="rh-vacation-chart-actions">
                        <button
                            type="button"
                            class="rh-vacation-chart-action"
                            data-rh-vacation-expand="saldo-secao"
                            title="Expandir gráfico"
                            aria-label="Expandir gráfico">
                            <span aria-hidden="true">↗</span>
                        </button>
                    </div>
                </div>
                <div class="rh-vacation-chart-legend">
                    <span>
                        <i class="rh-vacation-chart-dot rh-vacation-chart-dot--saldo"></i>
                        Saldo
                    </span>
                    <span>
                        <i class="rh-vacation-chart-dot rh-vacation-chart-dot--gozado"></i>
                        Dias gozados
                    </span>
                </div>
                <div class="rh-chart-body">
                    <div
                        id="rhVacationChartSecao_${instanceId}"
                        class="rh-vacation-echart">
                    </div>
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
        <div class="rh-table-card" data-rh-kpi="vencendo">
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
            <span class="rh-table-hint">Clique para ver todos os vencimentos</span>
        </div>
        <div class="rh-table-card" data-rh-kpi="agora">
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
            <span class="rh-table-hint">Clique para ver os colaboradores de férias</span>
        </div>
    </div>
</section>
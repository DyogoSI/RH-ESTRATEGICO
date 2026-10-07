<section id="rhTermination_${instanceId}" class="rh-termination">
  <div id="rhTerminationCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Rescisões</h2>
            <p>Desligamentos, motivos, tempo de empresa e valores pagos</p>
        </div>
        <button
            type="button"
            id="rhTerminationExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>

    <div class="rh-kpi-grid rh-termination-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="total" title="Clique para ver as rescisões">
            <span class="rh-kpi-label">Total de Rescisões</span>
            <strong id="rhTerminationTotal_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">No período selecionado</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="tempoMedio" title="Clique para ver as rescisões">
            <span class="rh-kpi-label">Tempo Médio de Empresa</span>
            <strong id="rhTerminationTempoMedio_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Por colaborador desligado</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="totalLiquido" title="Clique para ver as rescisões">
            <span class="rh-kpi-label">Total Líquido Pago</span>
            <strong id="rhTerminationTotalLiquido_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span class="rh-kpi-description">Soma das verbas rescisórias</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="totalFgts" title="Clique para ver as rescisões">
            <span class="rh-kpi-label">Total FGTS 40%</span>
            <strong id="rhTerminationTotalFgts_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span class="rh-kpi-description">Multa rescisória acumulada</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="iniciativaEmpresa" title="Clique para ver as rescisões">
            <span class="rh-kpi-label">Iniciativa da Empresa</span>
            <strong id="rhTerminationIniciativaEmpresa_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Desligamentos sem justa causa pelo empregador</span>
        </div>
    </div>

    <div id="rhTerminationDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Rescisões por Mês</h3>
                    <span>Evolução no período selecionado</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhTerminationChartMes_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Motivo da Rescisão</h3>
                    <span>Distribuição por motivo</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhTerminationChartMotivo_${instanceId}"></canvas>
            </div>
        </div>
    </div>

    <div class="rh-chart-card rh-termination-ranking rh-light">
        <div class="rh-chart-header">
            <div>
                <h3>Por Tempo de Empresa</h3>
                <span>Quantidade de rescisões em cada faixa</span>
            </div>
        </div>
        <div class="rh-chart-body">
            <canvas id="rhTerminationChartFaixaTempo_${instanceId}"></canvas>
        </div>
    </div>
  </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhTerminationGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhTerminationGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card rh-light" data-rh-kpi="total">
            <div class="rh-chart-header">
                <div>
                    <h3>Últimas Rescisões</h3>
                    <span>20 desligamentos mais recentes no período selecionado</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Chapa</th>
                        <th>Colaborador</th>
                        <th>Seção</th>
                        <th>Função</th>
                        <th>Motivo</th>
                        <th>Tipo</th>
                        <th>Data Rescisão</th>
                    </tr>
                </thead>
                <tbody id="rhTerminationTabelaUltimas_${instanceId}"></tbody>
            </table>
            <span class="rh-table-hint">Clique para ver as rescisões</span>
        </div>
    </div>
</section>

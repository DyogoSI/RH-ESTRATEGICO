<section id="rhLeave_${instanceId}" class="rh-leave">
  <div id="rhLeaveCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Afastamentos</h2>
            <p>Acompanhamento de afastamentos, dias perdidos e casos de longa duração</p>
        </div>
        <button
            type="button"
            id="rhLeaveExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>

    <div class="rh-kpi-grid rh-leave-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="total" title="Clique para ver os afastamentos">
            <span class="rh-kpi-label">Total de Afastamentos</span>
            <strong id="rhLeaveTotal_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">No período selecionado</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="afastadosAgora" title="Clique para ver os afastamentos">
            <span class="rh-kpi-label">Afastados Atualmente</span>
            <strong id="rhLeaveAtuais_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Sem retorno informado</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="diasPerdidos" title="Clique para ver os afastamentos">
            <span class="rh-kpi-label">Dias Perdidos</span>
            <strong id="rhLeaveDiasPerdidos_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Soma de dias afastados</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="mediaDias" title="Clique para ver os afastamentos">
            <span class="rh-kpi-label">Média de Dias</span>
            <strong id="rhLeaveMediaDias_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Por afastamento</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="acidentes" title="Clique para ver os afastamentos">
            <span class="rh-kpi-label">Acidentes de Trabalho</span>
            <strong id="rhLeaveAcidentes_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">No período selecionado</span>
        </div>
    </div>

    <div id="rhLeaveDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Por Tipo de Afastamento</h3>
                    <span>Distribuição por motivo agrupado</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhLeaveChartTipo_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Por Duração</h3>
                    <span>Até 3, 4 a 15 e acima de 15 dias</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhLeaveChartDuracao_${instanceId}"></canvas>
            </div>
        </div>
    </div>

    <div class="rh-chart-card rh-leave-ranking">
        <div class="rh-chart-header">
            <div>
                <h3>Ranking de Dias Perdidos por Seção</h3>
                <span>Top 8 seções com mais dias de afastamento</span>
            </div>
        </div>
        <div class="rh-chart-body">
            <canvas id="rhLeaveChartRanking_${instanceId}"></canvas>
        </div>
    </div>
  </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhLeaveGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhLeaveGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Afastados com Mais de 30 Dias</h3>
                    <span>Casos em aberto, ordenados por dias afastados</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Chapa</th>
                        <th>Colaborador</th>
                        <th>Seção</th>
                        <th>Tipo</th>
                        <th>Início</th>
                        <th>Dias</th>
                    </tr>
                </thead>
                <tbody id="rhLeaveTabelaLongoPrazo_${instanceId}"></tbody>
            </table>
        </div>
    </div>
</section>

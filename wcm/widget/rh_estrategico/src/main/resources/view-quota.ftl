<section id="rhQuota_${instanceId}" class="rh-quota">
  <div id="rhQuotaCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Cotas</h2>
            <p>Cumprimento das cotas legais de PCD e Aprendiz por filial</p>
        </div>
        <button
            type="button"
            id="rhQuotaExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>

    <h3 class="rh-quota-subtitle">Cota PCD</h3>
    <div class="rh-kpi-grid rh-quota-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="pcdBase" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">Colaboradores Ativos</span>
            <strong id="rhQuotaPcdBase_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Base de cálculo</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="pcdCota" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">Cota Exigida</span>
            <strong id="rhQuotaPcdExigida_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Conforme faixa legal</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="pcdAtual" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">PCD Atuais</span>
            <strong id="rhQuotaPcdAtual_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Colaboradores PCD ativos</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="pcdFaltante" title="Clique para ver as filiais com déficit">
            <span class="rh-kpi-label">Faltante</span>
            <strong id="rhQuotaPcdFaltante_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Para cumprir a cota</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="pcdPercentual" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">% Cumprimento</span>
            <strong id="rhQuotaPcdPercentual_${instanceId}" class="rh-kpi-value">-</strong>
            <span class="rh-kpi-description">Atual sobre cota exigida</span>
        </div>
    </div>

    <h3 class="rh-quota-subtitle">Cota Aprendiz</h3>
    <div class="rh-kpi-grid rh-quota-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="aprendizBase" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">Base de Cálculo</span>
            <strong id="rhQuotaAprendizBase_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Colaboradores elegíveis</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="aprendizMinimo" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">Mínimo Exigido</span>
            <strong id="rhQuotaAprendizMinimo_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">5% da base de cálculo</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="aprendizAtual" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Aprendizes Atuais</span>
            <strong id="rhQuotaAprendizAtual_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Contratados hoje</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="aprendizFaltante" title="Clique para ver as filiais com déficit">
            <span class="rh-kpi-label">Faltante</span>
            <strong id="rhQuotaAprendizFaltante_${instanceId}" class="rh-kpi-value">0</strong>
            <span class="rh-kpi-description">Para atingir o mínimo</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="aprendizPercentual" title="Clique para ver o detalhamento por filial">
            <span class="rh-kpi-label">% Cumprimento</span>
            <strong id="rhQuotaAprendizPercentual_${instanceId}" class="rh-kpi-value">-</strong>
            <span class="rh-kpi-description">Atual sobre mínimo exigido</span>
        </div>
    </div>

    <div id="rhQuotaDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Status da Cota PCD</h3>
                    <span>Cumprimento por filial</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhQuotaChartPcdStatus_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Status da Cota Aprendiz</h3>
                    <span>Cumprimento por filial</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhQuotaChartAprendizStatus_${instanceId}"></canvas>
            </div>
        </div>
    </div>

    <div class="rh-chart-card rh-quota-ranking">
        <div class="rh-chart-header">
            <div>
                <h3>Ranking de Déficit por Filial</h3>
                <span>Soma do déficit de PCD e Aprendiz (top 8)</span>
            </div>
        </div>
        <div class="rh-chart-body">
            <canvas id="rhQuotaChartRanking_${instanceId}"></canvas>
        </div>
    </div>
  </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhQuotaGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhQuotaGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Cumprimento PCD por Filial</h3>
                    <span>Todas as colunas do DS.FLUIG.0004</span>
                </div>
            </div>
            <div class="rh-table-scroll">
                <table class="rh-table">
                    <thead>
                        <tr>
                            <th>CNPJ Coligada</th>
                            <th>Cód. Coligada</th>
                            <th>Coligada</th>
                            <th>Cód. Filial</th>
                            <th>Filial</th>
                            <th>CNPJ Filial</th>
                            <th>Base</th>
                            <th>Faixa</th>
                            <th>Limite Superior</th>
                            <th>% Legal</th>
                            <th>PCD Atuais</th>
                            <th>Cota Bruta</th>
                            <th>Cota Calculada</th>
                            <th>Faltante</th>
                            <th>% Cumprimento</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="rhQuotaTabelaPcd_${instanceId}"></tbody>
                </table>
            </div>
        </div>

        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Cumprimento Aprendiz por Filial</h3>
                    <span>Todas as colunas do DS.FLUIG.0004.1</span>
                </div>
            </div>
            <div class="rh-table-scroll">
                <table class="rh-table">
                    <thead>
                        <tr>
                            <th>Cód. Coligada</th>
                            <th>Coligada</th>
                            <th>CNPJ Coligada</th>
                            <th>Cód. Filial</th>
                            <th>Filial</th>
                            <th>CNPJ Filial</th>
                            <th>Base</th>
                            <th>Mínimo</th>
                            <th>Máximo</th>
                            <th>Atual</th>
                            <th>Faltante</th>
                            <th>% Cumprimento</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="rhQuotaTabelaAprendiz_${instanceId}"></tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card">
            <div class="rh-chart-header">
                <div>
                    <h3>Aprendizes com Contrato Vencendo</h3>
                    <span>Vencimento em até 45 dias</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Colaborador</th>
                        <th>Filial</th>
                        <th>Término</th>
                        <th>Dias Restantes</th>
                    </tr>
                </thead>
                <tbody id="rhQuotaTabelaVencimentos_${instanceId}"></tbody>
            </table>
        </div>
    </div>
</section>

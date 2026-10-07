<section id="rhBenefit_${instanceId}" class="rh-benefit">
  <div id="rhBenefitCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Benefícios</h2>
            <p>Custos por competência, quem custeia e distribuição por benefício e unidade</p>
            <p id="rhBenefitPeriodoInfo_${instanceId}"></p>
        </div>
        <button
            type="button"
            id="rhBenefitExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>

    <div class="rh-kpi-grid rh-benefit-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="total" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Custo Total de Benefícios</span>
            <strong id="rhBenefitTotal_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span class="rh-kpi-description">No período exibido</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="empresa" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Custeado pela Empresa</span>
            <strong id="rhBenefitEmpresa_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span id="rhBenefitEmpresaPct_${instanceId}" class="rh-kpi-description">0,0% do custo total</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="colaborador" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Descontado dos Colaboradores</span>
            <strong id="rhBenefitColaborador_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span id="rhBenefitColaboradorPct_${instanceId}" class="rh-kpi-description">0,0% do custo total</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="colaboradores" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Colaboradores com Benefício</span>
            <strong id="rhBenefitColaboradores_${instanceId}" class="rh-kpi-value">0</strong>
            <span id="rhBenefitColaboradoresInfo_${instanceId}" class="rh-kpi-description">0 titulares · 0 com dependentes</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="media" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Média por Colaborador</span>
            <strong id="rhBenefitMedia_${instanceId}" class="rh-kpi-value">R$ 0,00</strong>
            <span class="rh-kpi-description">Custo médio por colaborador ao mês</span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--red" data-rh-kpi="variacao" title="Clique para ver as competências">
            <span class="rh-kpi-label">Variação vs Mês Anterior</span>
            <strong id="rhBenefitVariacao_${instanceId}" class="rh-kpi-value">—</strong>
            <span id="rhBenefitVariacaoInfo_${instanceId}" class="rh-kpi-description">Última competência fechada</span>
        </div>
    </div>

    <div id="rhBenefitDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Evolução Mensal dos Custos</h3>
                    <span>Custeado pela empresa x descontado dos colaboradores, por competência</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhBenefitChartMes_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Quem Custeia</h3>
                    <span>Divisão do custo total</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhBenefitChartGrupo_${instanceId}"></canvas>
            </div>
        </div>
    </div>

    <div class="rh-benefit-grid">
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Custo por Benefício</h3>
                    <span>Valor total de cada benefício no período</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--tall">
                <canvas id="rhBenefitChartBeneficio_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Colaboradores por Benefício</h3>
                    <span>Quantos colaboradores têm cada benefício</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--tall">
                <canvas id="rhBenefitChartColaboradores_${instanceId}"></canvas>
            </div>
        </div>
    </div>

    <div class="rh-benefit-grid">
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Maiores Custos por Filial</h3>
                    <span>Top 10 filiais com maior custo de benefícios</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhBenefitChartFilial_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Maiores Custos por Seção</h3>
                    <span>Top 10 seções com maior custo de benefícios</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhBenefitChartSecao_${instanceId}"></canvas>
            </div>
        </div>
    </div>
  </div>

    <div class="rh-table-actions">
        <button
            type="button"
            id="rhBenefitGerarPdf_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar PDF
        </button>
        <button
            type="button"
            id="rhBenefitGerarXlsx_${instanceId}"
            class="rh-btn rh-btn-secondary">
            Gerar Planilha
        </button>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Resumo por Benefício</h3>
                    <span>Total, colaboradores, média por colaborador e peso de cada benefício no custo</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Benefício</th>
                        <th>Tipo</th>
                        <th>Colaboradores</th>
                        <th>Total</th>
                        <th>Média por Colaborador</th>
                        <th>% do Total</th>
                    </tr>
                </thead>
                <tbody id="rhBenefitTabelaBeneficios_${instanceId}"></tbody>
            </table>
        </div>
    </div>

    <div class="rh-table-grid rh-table-grid--single">
        <div class="rh-table-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Variação entre Competências</h3>
                    <span>Custo de cada mês contra o anterior — variações acima de 10% ficam destacadas</span>
                </div>
            </div>
            <table class="rh-table">
                <thead>
                    <tr>
                        <th>Competência</th>
                        <th>Total</th>
                        <th>Variação (R$)</th>
                        <th>Variação (%)</th>
                        <th>Situação</th>
                    </tr>
                </thead>
                <tbody id="rhBenefitTabelaVariacao_${instanceId}"></tbody>
            </table>
        </div>
    </div>
</section>

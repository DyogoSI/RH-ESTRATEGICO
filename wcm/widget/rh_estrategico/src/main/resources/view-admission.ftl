<section id="rhAdmission_${instanceId}" class="rh-admission">
  <div id="rhAdmissionCaptura_${instanceId}">
    <div class="rh-section-header">
        <div>
            <h2>Admissões</h2>
            <p>Indicadores e acompanhamento das admissões</p>
        </div>
        <button
            type="button"
            id="rhAdmissionExportar_${instanceId}"
            class="rh-btn rh-btn-secondary rh-no-print">
            Exportar Imagem
        </button>
    </div>
    <div class="rh-kpi-grid rh-admission-kpis">
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="total" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Total de Admissões</span>
            <strong
                id="rhAdmissionTotal_${instanceId}"
                class="rh-kpi-value">
                0
            </strong>
            <span class="rh-kpi-description">
                No período selecionado
            </span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="clt" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">CLT</span>
            <strong
                id="rhAdmissionClt_${instanceId}"
                class="rh-kpi-value">
                0
            </strong>
            <span class="rh-kpi-description">
                Contratações CLT
            </span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--purple" data-rh-kpi="estagio" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Estágio</span>
            <strong
                id="rhAdmissionEstagio_${instanceId}"
                class="rh-kpi-value">
                0
            </strong>
            <span class="rh-kpi-description">
                Contratações de estágio
            </span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--orange" data-rh-kpi="aprendiz" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Aprendiz</span>
            <strong
                id="rhAdmissionAprendiz_${instanceId}"
                class="rh-kpi-value">
                0
            </strong>
            <span class="rh-kpi-description">
                Jovens aprendizes
            </span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--blue" data-rh-kpi="outros" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Outros</span>
            <strong
                id="rhAdmissionOutros_${instanceId}"
                class="rh-kpi-value">
                0
            </strong>
            <span class="rh-kpi-description">
                Outros vínculos
            </span>
        </div>
        <div class="rh-kpi-card rh-kpi-card--green" data-rh-kpi="salarioMedio" title="Clique para ver os colaboradores">
            <span class="rh-kpi-label">Salário Médio de Entrada</span>
            <strong
                id="rhAdmissionSalarioMedio_${instanceId}"
                class="rh-kpi-value">
                R$ 0,00
            </strong>
            <span class="rh-kpi-description">
                Média salarial das admissões
            </span>
        </div>
    </div>

    <div id="rhAdmissionDrilldown_${instanceId}" class="rh-drilldown"></div>

    <div class="rh-chart-grid">
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Admissões por Mês</h3>
                    <span>Evolução no período selecionado</span>
                </div>
            </div>
            <div class="rh-chart-body">
                <canvas id="rhAdmissionChartMes_${instanceId}"></canvas>
            </div>
        </div>
        <div class="rh-chart-card rh-light">
            <div class="rh-chart-header">
                <div>
                    <h3>Tipo de Contratação</h3>
                    <span>Distribuição das admissões</span>
                </div>
            </div>
            <div class="rh-chart-body rh-chart-body--donut">
                <canvas id="rhAdmissionChartTipo_${instanceId}"></canvas>
            </div>
        </div>
    </div>
  </div>
</section>
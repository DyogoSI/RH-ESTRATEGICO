<div
    id="RHEstrategico_${instanceId}"
    class="super-widget wcm-widget-class fluig-style-guide rh-estrategico-widget"
    data-params="RHEstrategico.instance()">

    <#include "partial-header.ftl">

    <div class="rh-shell">
        <aside class="rh-sidebar">
            <#include "partial-navigation.ftl">
        </aside>

        <div class="rh-content">
            <#include "partial-filters.ftl">

            <main class="rh-main-content">

            <div class="rh-view-container active" data-rh-content="overview">
                <#include "view-overview.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="admission">
                <#include "view-admission.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="termination">
                <#include "view-termination.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="vacation">
                <#include "view-vacation.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="leave">
                <#include "view-leave.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="contract">
                <#include "view-contract.ftl">
            </div>

            <div class="rh-view-container" data-rh-content="quota">
                <#include "view-quota.ftl">
            </div>

            </main>
        </div>
    </div>

    <#include "partial-loading.ftl">

</div>

<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
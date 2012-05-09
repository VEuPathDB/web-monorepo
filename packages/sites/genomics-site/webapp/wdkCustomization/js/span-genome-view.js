function initializeGenomeView() {
    // register click events
    assignStickyTooltipByElement(".genome-view .sequence .span");
	
    $(".genome-view").each(function() {
        var genomeView = $(this);
        if (genomeView.attr("initialized") == "true") return;

        genomeView.find(".sequence .ruler").click(function() {
            window.location.href = $(this).parents(".sequence").find(".sequence-id a").attr("href");
        });

        // register zoom events
        genomeView.find(".sequence .zoomin").button().click(function() {
            zoomInGenomeView(this);
        });
        genomeView.find(".sequence .zoomout").button({ disabled: true }).click(function() {
            zoomOutGenomeView(this);
        });
        genomeView.find(".zoomin-all").button().click(function() {
            zoomInAllGenomeView(genomeView);
        });
        genomeView.find(".zoomout-all").button().click(function() {
            zoomOutAllGenomeView(genomeView);
        });

        // register datatables. it has to be the last step, otherwise the rest of 
        // the registration will be applied to the current page only.
        genomeView.dataTable({
            "bJQueryUI": true,
            "aLengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            "iDisplayLength": 25,
            "sDom":'<"H"iplfr>t<"F"ip>',
            "aaSorting": [[3,'desc']],
            "aoColumns": [ null,
                           null,
                           null,
                           null,
                           null,
                           { "bSortable": false },
                           { "bSortable": false } ]
        });

        // set initialized flag, make sure only initialize once
        genomeView.attr("initialized", "true");
    });
}

function zoomInGenomeView(ele) {
    var spans = $(ele).parents(".sequence").find(".spans");
    var size = parseFloat(spans.attr("size"));
    var newSize = size * 1.5;

    // remove previous id
    var id = spans.attr("timer");
    if (id != undefined) stopTimer(spans, id);

    var increment = (newSize - size) / 5;
    id = setInterval(function() {
        size += increment;
        spans.css("width", size + "%");
        if (size >= newSize) {
            stopTimer(spans, id);
            spans.css("width", newSize + "%");
        }
    }, 4);
    spans.attr("timer", id);
    spans.attr("size", newSize);
    var zoomout = $(ele).siblings(".zoomout");
    if (zoomout.button("option", "disabled"))
        zoomout.button("option", "disabled", false);
}

function zoomOutGenomeView(ele) {
    var spans = $(ele).parents(".sequence").find(".spans");
    var size = parseFloat(spans.attr("size"));
    var baseSize = parseFloat(spans.attr("base-size"));
    // the new size will be 1.5 times less than the current one
    var newSize = size / 1.5;
    if (newSize < baseSize) newSize = baseSize;

    // remove previous id
    var id = spans.attr("timer");
    if (id != undefined) stopTimer(spans, id);

    var increment = (newSize - size) / 5;
    id = setInterval(function() {
        size += increment;
        spans.css("width", size + "%");
        if (size <= newSize) {
            stopTimer(spans, id);
            spans.css("width", newSize + "%");
        }
    }, 4);
    spans.attr("timer", id);
    spans.attr("size", newSize);
    if (newSize == baseSize) $(ele).button("option", "disabled", true); 
}

function stopTimer(spans, id) {
    clearInterval(id);
    spans.removeAttr("timer");
}

function zoomInAllGenomeView(genomeViewSelector) {
    $(genomeViewSelector).find(".sequence .zoomin").click();
}

function zoomOutAllGenomeView(genomeViewSelector) {
    $(genomeViewSelector).find(".sequence .zoomout").each(function() {
        if (!$(this).button("option", "disabled"))
            $(this).click();
    });
}

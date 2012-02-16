function initializeGenomeView() {
    // register click events
    $("#genome-view .sequence .span").click(function() {
        window.location.href = $(this).attr("url");
    });

    // register datatables
    $("#genome-view").dataTable({
        "bJQueryUI": true,
        "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
        "iDisplayLength": -1
    });

    // register zoom events
    $("#genome-view .sequence .zoomin").button().click(function() {
        zoomInGenomeView(this);
    });
    $("#genome-view .sequence .zoomout").button({ disabled: true }).click(function() {
        zoomOutGenomeView(this);
    });
}

function zoomInGenomeView(ele) {
    var spans = $(ele).parents(".sequence").find(".spans");
    var size = parseFloat(spans.attr("size"));
    var newSize = size * 1.5;

    var increment = (newSize - size) / 10;
    var id = setInterval(function() {
        size += increment;
        spans.css("width", size + "%");
        if (size >= newSize) {
            clearInterval(id);
            spans.css("width", newSize + "%");
        }
    }, 4);
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

    var increment = (newSize - size) / 10;
    var id = setInterval(function() {
        size += increment;
        spans.css("width", size + "%");
        if (size <= newSize) {
            clearInterval(id);
            spans.css("width", newSize + "%");
        }
    }, 4);
    spans.attr("size", newSize);
    if (newSize == baseSize) $(ele).button("option", "disabled", true); 
}

function initializeGenomeView() {
    // register click events
    $("#genome-view .sequence .span").click(function() {
        window.location.href = $(this).attr("url");
    });
    // register datatables
    $("#genome-view").dataTable({
        "aLengthMenu": [[25, 50, 100, -1], [25, 50, 100, "All"]],
        "iDisplayLength": 50
    });
}

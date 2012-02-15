function initializeGenomeView() {
    // register click events
    $("#genome-view .sequence .span").click(function() {
        window.location.href = $(this).attr("url");
    });
    // register datatables
    $("#genome-view").dataTable();
}

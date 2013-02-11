function initializeGenomeView() {
    var tooltip = window.wdk.tooltips;
    $(".genome-view").each(function() {
        var genomeView = $(this);
        if (genomeView.attr("initialized") == "true") return;

        // register events onto sequences
        genomeView.find(".datatables .sequence").each(function() {
            var sequence = $(this);
            var sequenceId = sequence.find(".sequence-id").text();
            var canvas = sequence.find(".canvas");
            var sequenceData = genomeView.find("#sequences #" + sequenceId + ".sequence");

            // click on ruler to goto the sequence record page.
            canvas.find(".ruler").click(function() {
                window.location.href = $(this).parents(".sequence").find(".sequence-id a").attr("href");
            });

            canvas.find(".region").click(function() {
                var regionId = $(this).attr("data-id");
                var content = sequenceData.find(".regions #" + regionId).clone();

                var flag = content.data("registered");
                if (flag != "true") {
                    content.data("registered", "true");
                    // register tooltips on sequences
                    content.find(".canvas .feature").each(function() {
                        var featureId = $(this).attr("id");
                        var feature = content.find(".features #" + featureId);
                        tooltip.setUpStickyTooltip(this, feature);
                    });
                }
                content.dialog({width:500});
            });
        });

        // register datatables. it has to be the last step, otherwise the rest of 
        // the registration will be applied to the current page only.
        genomeView.find(".datatables").dataTable({
            "bJQueryUI": true,
            "aLengthMenu": [[10, 25, -1], [10, 25, "All"]],
            "iDisplayLength": 25,
            "sDom":'<"H"iplfr>t<"F"ip>',
            "aaSorting": [[4,'desc']],
            "aoColumns": [ null,
                           null,
                           null,
                           null,
                           null,
                           { "bSortable": false } ]
        });

        // set initialized flag, make sure only initialize once
        genomeView.attr("initialized", "true");
    });
}

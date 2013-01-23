function initializeGenomeView() {
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

            var tooltip = window.wdk.tooltips;
            canvas.find(".region").each(function() {
                var regionId = $(this).attr("data-id");
                var content = sequenceData.find(".regions #" + regionId);
                
                // register tooltip on features
                content.find(".feature").each(function() {
                    var featureId = $(this).attr("id");
                    var feature = sequenceData.find(".sequences #" + featureId);
                    tooltip.setUpStickyTooltip(this, feature);
                });
                
                tooltip.setUpStickyTooltip(this, content);
            });
        });

        // register datatables. it has to be the last step, otherwise the rest of 
        // the registration will be applied to the current page only.
        genomeView.find(".datatables").dataTable({
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

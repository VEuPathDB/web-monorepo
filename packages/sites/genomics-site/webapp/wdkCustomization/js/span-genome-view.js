function initializeSpanGenomeView() {
    // get the max length of the sequences
    var maxLength = 0;
    $("#genome-view .sequence").each(function() {
        var length = parseInt($(this).attr("length"));
        if (length > maxLength) maxLength = length;
    });

    $("#genome-view .sequence").each(function() {
        // scale sequence ruler
        var length = parseInt($(this).attr("length"));
        var rulerWidth = length * 100.0 / maxLength;
        var spans = $(this).find(".spans");
        spans.children(".ruler").css("width", rulerWidth + "%");

        // locate each span
        spans.children(".span").each(function() {
            // compute the start
            var start = parseInt($(this).attr("start"));
            var end = parseInt($(this).attr("end"));
            var spanStart = start * 100.0 / maxLength;
            var spanWidth = (end - start + 1) * 100.0 / maxLength;
            $(this).css("left", spanStart + "%")
                   .css("width", spanWidth + "%");
            var width = $(this).width();
        });
    });
}

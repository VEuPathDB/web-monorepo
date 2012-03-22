function initializeGenomeView() {
    // register click events
    $("#genome-view .sequence .span").each(function() {
        var span = $(this);
        var content = $(this).children(".tooltip");
        span.qtip({ content : content,
                       show: {
                               solo: true,
                               event: 'click mouseenter'
                             },
                       hide: {
                               event: 'click'
                             },
                       events: {
                                 show: function(event, api) {
                                       // qtip2 assigns an ID of "ui-tooltip-<id>" to the tooltip div
                                       var tipSelector = '#ui-tooltip-' + api.get('id');

                                       // define functions for hiding tooltip timer.
                                       var cancelDelayedHide = function() {
                                           // clear the previous timers
                                           var timer = $(tipSelector).attr("timer");
                                           if (timer != undefined) {
                                               clearTimeout(timer);
                                               $(tipSelector).removeAttr("timer");
                                           }
                                       }
                                       var hide = function(){
                                           $(tipSelector).qtip('hide'); 
                                           cancelDelayedHide();
                                       };
                                       var delayedHide = function() {
                                           cancelDelayedHide();
                                           var timer = setTimeout("$('" + tipSelector + "').qtip('hide');", 1000);
                                           $(tipSelector).attr("timer", timer);
                                       };
                                      
                                       // when mouseover the span, canel delayed hiding, if there's any;
                                       // when mouseout the span, start delayed hiding tip.
                                       span.mouseover(cancelDelayedHide)
                                           .mouseout(delayedHide);
                                       // when mouse in tip, cancel delayed hiding; 
                                       // when clicking tip, hide tip immediately;
                                       // when mouse out tip, start delayed hiding.
                                       $(tipSelector).mouseover(cancelDelayedHide)
                                                     .click(hide)
                                                     .mouseout(delayedHide);
                               }
                          }
                     });
    });
    $("#genome-view .sequence .ruler").click(function() {
        window.location.href = $(this).parents(".sequence").find(".sequence-id a").attr("href");
    });

    // register zoom events
    $("#genome-view .sequence .zoomin").button().click(function() {
        zoomInGenomeView(this);
    });
    $("#genome-view .sequence .zoomout").button({ disabled: true }).click(function() {
        zoomOutGenomeView(this);
    });
    $("#genome-view .zoomin-all").button().click(zoomInAllGenomeView);
    $("#genome-view .zoomout-all").button().click(zoomOutAllGenomeView);

    // register datatables. it has to be the last step, otherwise the rest of 
    // the registration will be applied to the current page only.
    $("#genome-view").dataTable({
        "bJQueryUI": true,
        "aLengthMenu": [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
        "iDisplayLength": 25,
        "aoColumns": [ null,
                       null,
                       null,
                       null,
                       { "bSortable": false },
                       { "bSortable": false } ]
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

function zoomInAllGenomeView() {
    $("#genome-view .sequence .zoomin").click();
}

function zoomOutAllGenomeView() {
    $("#genome-view .sequence .zoomout").each(function() {
        if (!$(this).button("option", "disabled"))
            $(this).click();
    });
}

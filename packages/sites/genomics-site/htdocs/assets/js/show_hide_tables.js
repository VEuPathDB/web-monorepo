$(document).ready(function() {
    var toggler = new TableToggler();
    toggler.initialize();
});


function TableToggler() {

    this.initialize = function() {
        var toggler = this;
        // attach the event handlers
        $("#record-toolbox a.show-all").click(toggler.showAll)
                                       .attr("href", "javascript:void(0);");
        $("#record-toolbox a.hide-all").click(toggler.hideAll)
                                       .attr("href", "javascript:void(0);");
    }

    this.showAll = function() {
        $(".toggle, .toggle-handle").each(function() {
                            var name = $(this).attr("name");
                            showLayer(name);
                            $(this).find("a").text("Hide");
                            storeIntelligentCookie('show' + name, 1);
                        });
        return 0;
    }

    this.hideAll = function() {
        $(".toggle, .toggle-handle").each(function() {
                            var name = $(this).attr("name");
                            hideLayer(name);
                            $(this).find("a").text("Show");
                            storeIntelligentCookie('show' + name, 0);
                        });
        return 0;
    }

}

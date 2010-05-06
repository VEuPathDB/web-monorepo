jQuery(document).ready(function() {
    var toggler = new TableToggler();
    toggler.initialize();
});


function TableToggler() {

    this.initialize = function() {
        var toggler = this;
        // attach the event handlers
        jQuery("#record-toolbox a.show-all").click(toggler.showAll)
                                       .attr("href", "javascript:void(0);");
        jQuery("#record-toolbox a.hide-all").click(toggler.hideAll)
                                       .attr("href", "javascript:void(0);");
    }

    this.showAll = function() {
        jQuery(".toggle, .toggle-handle").each(function() {
                            var name = jQuery(this).attr("name");
                            var display = jQuery('#' + name.replace(/:/g,"\\:")).css('display');
                            if (display != 'block') {
                               var onclick = jQuery(this).find('a').attr('href');
                               onclick = onclick.substring(11);
                               eval(onclick);
                            }
                        });
        return 0;
    }

    this.hideAll = function() {
        jQuery(".toggle, .toggle-handle").each(function() {
                            var name = jQuery(this).attr("name");
                            var display = jQuery('#' + name.replace(/:/g,"\\:")).css('display');
                            var controlName = jQuery(this).attr('id');
                            if (display != 'none') {
                               var onclick = jQuery(this).find('a').attr('href');
                               onclick = onclick.substring(11);
                               eval(onclick);
                            }
                        });
        return 0;
    }

}

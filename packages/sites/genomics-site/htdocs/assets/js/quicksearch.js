jQuery(document).ready(function() {
    var quickSearch = new QuickSearch();
    quickSearch.LoadQuickSearch();
});

function QuickSearch() {

    this.LoadQuickSearch = function() {
       var quickSearch = this;
       var wdk = new WDK();
       var session = jQuery("#quick-search").attr("session-id");
       jQuery("#quick-search form").each(function() {
           var form = this;
           // load previous input, if have any
           jQuery(form).find("input[type='text']").each(function() {
               var name = quickSearch.getName(this.name);
               var value = wdk.readCookie(name);
               if (value != null) this.value = value; 
           });
           jQuery(form).submit(function() {
               jQuery(form).find("input[type=text]").each(function() {
                   var name = quickSearch.getName(this.name);
                   var value = this.value;
                   // if the value is too big, do not save the cookie.
                   if (value.length <= 50) wdk.createCookie(name, value, 30);
                   return true;
               });
           });
       }); 
    };

    this.getName = function(name) {
       var pos = name.indexOf("(");
       if (pos >= 0) name = name.substr(pos + 1, name.length - pos - 2);
       return name;
    };
}

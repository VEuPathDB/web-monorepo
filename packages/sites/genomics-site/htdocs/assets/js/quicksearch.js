$(document).ready(function() {
    var quickSearch = new QuickSearch();
    quickSearch.LoadQuickSearch();
});

function QuickSearch() {

    this.LoadQuickSearch = function() {
       var quickSearch = this;
       var wdk = new WDK();
       var session = $("#quick-search").attr("session-id");
       $("#quick-search form").each(function() {
           var form = this;
           // load previous input, if have any
           $(form).find("input[type='text']").each(function() {
               var name = session + "_" + quickSearch.getName(this.name);
               var value = wdk.readCookie(name);
               if (value != null) this.value = value; 
           });
           $(form).submit(function() {
               $(form).find("input[type=text]").each(function() {
                   var name = session + "_" +  quickSearch.getName(this.name);
                   var value = this.value;
                   wdk.createCookie(name, value, 365);
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

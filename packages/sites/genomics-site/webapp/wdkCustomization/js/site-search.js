if (window.ApiDB == undefined) ApiDB = {};
ApiDB.SiteSearch = {};

$(function() {
    ApiDB.SiteSearch.loadResults();
});

ApiDB.SiteSearch.SUMMARY_SIZE = 25;

ApiDB.SiteSearch.loadResults = function() {
    var siteSearch = ApiDB.SiteSearch;
    
    // load record counts
    $("#site-search fieldset.record").each(function() {
        siteSearch.loadRecordResults($(this));
    });

    // load resource results
    $("#site-search fieldset.resource").each(function() {
        siteSearch.loadResourceResults($(this));
    });
};

ApiDB.SiteSearch.loadRecordResults = function(recordSelector) {
    var record = $(recordSelector);
    var url = record.attr("url");
    $.ajax({
        type: "GET",
        dataType: "html",
        url: url,
        success: function(data, textStatus, jqXHR) {
            var source = $("<div>" + data + "</div>");
            source = $(source[0]);

            // parse the count, and url to default tab
            var loaded = record.find(".loaded");
            var count = source.find("#text_step_count").text();
            if (count == '') {
                loaded.find(".count").text("0");
                record.find(".loading").hide();
                record.find(".wait").hide();    
                loaded.show();
                return;
            }

            var summaryUrl = source.find("#Summary_Views #_default > a").attr("href");
           
            // set count
            loaded.find(".count").text(count);
 loaded.show();
 record.find(".loading").hide();
 record.find(".wait").hide();

            // load result summary
 /*           var result = record.find(".result");
            var summary = result.find(".summary");
            $.ajax({
                type: "GET",
                dataType: "html",
                url: summaryUrl,
                success: function(data, textStatus, jqXHR) {
                    var source = $("<div>" + data + "</div>");
                    source = $(source[0]);

                    // get links to records
                    var records = source.find(".Results_Table .primaryKey");
                    var length = Math.min(records.length, ApiDB.SiteSearch.SUMMARY_SIZE);
                    result.find(".count").text(length);
                    for (var i = 0; i < length; i++) {
                        var recordLink = $("<li></li>").append($(records[i]).next("a"));
                        summary.append(recordLink);
                    }
                    record.find(".loading").hide();
                    record.find(".wait").hide();
                    loaded.show();
                    result.show();
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    record.find(".wait").hide();
                    record.find(".error").show();
                }
            });
*/
        },
        error: function(jqXHR, textStatus, errorThrown) {
            record.find(".error").show();
        }


    });
};

ApiDB.SiteSearch.loadResourceResults = function(resourceSelector) {
    var resource = $(resourceSelector);
    // parse the count and results
    var source = resource.find(".source");
    var count = source.find(".search-header-table .search-count small").text().split(" ", 3)[1];
    var pages = source.find("div.search-results .search-results");

    // set count
    var loaded = resource.find(".loaded");
    loaded.find(".count").text(count);

    // set results
    var result =  resource.find(".result");
    var summary = result.find(".summary");
    var length = Math.min(pages.length, ApiDB.SiteSearch.SUMMARY_SIZE);
    result.find(".count").text(length);
    for (var i = 0; i < length; i++) {
        summary.append(pages[i]);
    }

    resource.find(".loading").hide();
    resource.find(".wait").hide();
    source.empty();
    loaded.show();
    result.show();
};



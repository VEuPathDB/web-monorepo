jQuery(document).ready(function() {

  $("div.expandable").hide();

  //toggle the componenet with class msg_body
  $("p.clickable").click(function() {
    $(this).next("div.expandable").slideToggle(100);
  });

  $(".expand_all").click(function(){
     $("div.expandable").slideDown(0);
  });

  $(".collapse_all").click(function(){
     $("div.expandable").slideUp(0);
  });

  $("body").loading({
    autoOpen: false
  });

  $.ajaxSetup({
    timeout: 1000 * 60 * 1, // 1 minute
    error: function(jqXHR, textStatus, errorThrown) {
      var text;
      if (textStatus == "timeout") {
        text = "Your request has timed out. Please check your server logs for any errors.";
      } else {
        text = "The following error occurred: " + textStatus;
      }
      $("<div>" + text + "</div>")
      .dialog({
        title: "Error: " + textStatus,
        resizeable: false,
        modal: true,
        buttons: {
          "OK": function() {
            $(this).dialog("close");
          }
        }
      });
    }
  });

});

function refreshWdkCacheCount() {
  $("#cache_table_count").load("view/wdkCacheTableCount.php", function(response, status, xhr) {
  if (status == "error") {
    var msg = "Sorry but there was an error: ";
    $("#cache_table_count").html(msg + xhr.status + " " + xhr.statusText);
  }
  });
}

function resetWdkCache() {
  content = "Are you sure?<br>"
          + "<span class=\"smalltext\">"
          + "<span class=\"warn\">Resetting the cache can break user strategies.</span><br>"
          + "Some cached data may be resident in memory, so reloading the webapp may also be required."
          + "</span>";
  $( "<div></div>" )
    .html(content)
    .dialog({
      title: "Reset WDK Cache",
      resizable: false,
      modal: true,
      buttons: {
        "Cancel": function() {
          $(this).dialog( "close" );
        },
        "Reset Cache": function() {
          $(this).dialog( "close" );
          $("body").loading("show");
          $("#cache_table_count").load("view/wdkCacheTableCount.php", { 'reset': '1' }, 
            function(response, status, xhr) {
              if (status == "error") {
                var msg = "<span class='fatal'>Ajax Error: " + xhr.status + " " + xhr.statusText + "</span>";
                $("#cache_table_count").html(msg);
              }
              $("body").loading("hide");
          })
        }
      }
    });   
}

function toggleWdkIsCaching() {
  $("#wdk_is_caching").load("view/wdkIsCaching.php", { 'toggle': '1' }, 
  function(response, status, xhr) {
    if (status == "error") {
      var msg = "Sorry but there was an error: ";
      $("#wdk_is_caching").html(msg + xhr.status + " " + xhr.statusText);
  }
  });
}

function reloadWebapp() {
  content = "Are you sure?<br>"
          + "</span>";
  $( "<div></div>" )
    .html(content)
    .dialog({
      title: "Reload Tomcat Webapp",
      resizable: false,
      modal: true,
      buttons: {
        "Cancel": function() {
          $(this).dialog( "close" );
        },
        "Reload Webapp": function() {
          $(this).dialog( "close" );
          $("body").loading("show");
          $("#webapp_uptime").load("view/reloadWebapp.php", { 'reload': '1' }, 
            function(response, status, xhr) {
              $("body").loading("hide");
              if (status == "error") {
                var msg = "<span class='fatal'>Ajax Error: " + xhr.status + " " + xhr.statusText + "</span>";
                $("#webapp_uptime").html(msg);
              }
          })
        }
      }
    });   
}

function blockUI() {
  $("<div id='blocking'></div>")
    .dialog({
      autoOpen: false,
      closeOnEscape: false,
      modal: true,
      open: function(event, ui) { 
        $(".ui-dialog-titlebar").hide();
        $(".ui-dialog").hide();
        $(".ui-dialog-titlebar-close").hide();
      }
     });
  $("#blocking").dialog("open");

}

function unblockUI() {
  $("#blocking")
    .dialog("close");
}

(function($) {
  var overlay,
      img,
      loading,
      methods = {
    init: function(options) {

      // singleton business
      if (this.data("_loading_init_")) {
        return this;
      } else {
        this.data("_loading_init_", true);
      }

      var settings = $.extend({
        autoOpen: true
      }, options);

      overlay = $("<div></div>").addClass("ui-widget-overlay")
        .hide()
        .appendTo("body");

      loading = $("<div><span>Loading...</span></div>")
      .attr("id", "loading")
      .hide()
      .appendTo("body");

      return (settings.autoOpen ?
        methods.show.apply(this, Array.prototype.slice.call(arguments, 1)) :
        this);
    },

    show: function() {
      overlay.show();

      loading.show()
        .css("z-index", overlay.css("z-index") + 1);

      return this;
    },

    hide: function() {
      overlay.hide();
      loading.hide();
      return this;
    }
  };

  $.fn.loading = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === "object" || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + method + " does not exist on jQuery.loading");
    }
  };

})(jQuery);

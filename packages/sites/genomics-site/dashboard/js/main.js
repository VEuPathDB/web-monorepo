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
          blockUI();
          $("#cache_table_count").load("view/wdkCacheTableCount.php", { 'reset': '1' }, 
            function(response, status, xhr) {
              if (status == "error") {
                var msg = "<span class='fatal'>Ajax Error: " + xhr.status + " " + xhr.statusText + "</span>";
                $("#cache_table_count").html(msg);
              }
              unblockUI();
          })
        }
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
          blockUI();
          $("#webapp_uptime").load("view/reloadWebapp.php", { 'reload': '1' }, 
            function(response, status, xhr) {
              if (status == "error") {
                var msg = "<span class='fatal'>Ajax Error: " + xhr.status + " " + xhr.statusText + "</span>";
                $("#webapp_uptime").html(msg);
              }
              unblockUI();
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
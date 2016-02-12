$(document).ready(function(){
  var dqg_speed = "fast";
  var sidebar_speed = "fast";

  //hide all of the sub list
  if ($("div.sub_list")) {
    $("div.sub_list").hide();

    $("ul.heading_list li a.heading").click(function() {
      var sublist = $(this).parents("li").find("div.sub_list");
      var icon = $(this).siblings("i.fa");

      if (icon.hasClass("fa-caret-right")) {
        icon.removeClass("fa-caret-right");
        icon.addClass("fa-caret-down");
      }
      else {
        icon.removeClass("fa-caret-down");
        icon.addClass("fa-caret-right");
      }
      sublist.slideToggle(dqg_speed);
      return false;
    });

    $("ul.heading_list li i.fa").click(function() {
      var sublist = $(this).parents("li").find("div.sub_list");
      var icon = $(this);

      if (icon.hasClass("fa-caret-right")) {
        icon.removeClass("fa-caret-right");
        icon.addClass("fa-caret-down");
      }
      else {
        icon.removeClass("fa-caret-down");
        icon.addClass("fa-caret-right");
      }
      sublist.slideToggle(dqg_speed);
      return false;
    });

    $("p.small a").click(function() {
      var val = $(this).attr("href");
      var headList = $(this).parent().siblings("ul.heading_list");

      if (val === "true") { // expand all
        var icon = $("li i.fa", headList);
        icon.removeClass("fa-caret-right");
        icon.addClass("fa-caret-down");
        $("div.sub_list", headList).slideDown(dqg_speed);
      } else {             // collapse all
        var icon = $("li i.fa", headList);
        $("div.sub_list", headList).slideUp(dqg_speed);
        icon.removeClass("fa-caret-down");
        icon.addClass("fa-caret-right");
      }
      return false;
    });

    var top_div = $("div#menu_lefttop");
    $("div", top_div).hide();
    var op = $("div#News",top_div);
    $("div#News",top_div).show();

    $("a.heading, a.heading p", top_div).click(function(){
      me = this;
      if (me.nodeName == "P") {
        me = $(this).parent();
      }
      if (op == null || op.prev("a").text() != $(me).text()) {
        if (op != null) {
          op.hide(sidebar_speed);
        }
        op = $(me).next("div");
        $(me).next("div").show(sidebar_speed);
      } else {
        op = null;
        $(me).next("div").hide(sidebar_speed);
      }
      putReadInCookie(this);
      return false;
    });
 }

  flagUnreadListItems();

  wdk.tooltips.assignTooltipsLeft('.dqg-tooltip', -3);
});

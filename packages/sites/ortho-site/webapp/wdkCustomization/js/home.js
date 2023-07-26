$(function () {
  var home = new Home();
  home.configureBubbles();
});

function Home() {
  this.configureBubbles = function () {
    $('#search-bubbles > ul > li').each(function () {
      var bubble = $(this);
      bubble.addClass('ui-widget ui-widget-content ui-corner-all');
      bubble
        .children('a')
        .addClass(
          'ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all'
        );
      bubble.find('ul a.category').each(function () {
        $(this)
          .addClass('opened')
          .click(function () {
            if ($(this).hasClass('opened')) {
              $(this).siblings('ul').hide();
              $(this).removeClass('opened');
            } else {
              $(this).siblings('ul').show();
              $(this).addClass('opened');
            }
          });
      });
    });
  };
}

wdk.namespace('eupathdb', function(ns, $) {
  'use strict';

  function TableToggler() {

    this.initialize = function() {
      var toggler = this;
      // attach the event handlers
      $("#record-toolbox a.show-all").click(toggler.showAll);
      $("#record-toolbox a.hide-all").click(toggler.hideAll);
    }

    this.showAll = function(event) {
      event.preventDefault();
      $(".toggle, .toggle-handle").each(function() {
        var name = $(this).attr("name");
        var display = $('#' + name.replace(/:/g,"\\:")).css('display');
        if (display != 'block') {
          $(this).find('a').trigger('click');
        }
      });
    }

    this.hideAll = function(event) {
      event.preventDefault();
      $(".toggle, .toggle-handle").each(function() {
        var name = $(this).attr("name");
        var display = $('#' + name.replace(/:/g,"\\:")).css('display');
        var controlName = $(this).attr('id');
        if (display != 'none') {
          $(this).find('a').trigger('click');
        }
      });
    }

  }

  ns.TableToggler = TableToggler;

});

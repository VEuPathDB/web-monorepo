/*
  Author: Phil Palmieri
          page12.com
  
  What it does: 'fixes' (i use the term very loosely)
                flexigrid so that it spans 99% of it container.
                
  How to use it: 1) add flexifluid.js to your head after flexigrid.js
                 2) set grid_name to the id of your grid.
                 3) chage onSuccess prop of flexigrid.js to read 'flexifluid'
                 
  note: addidn this layer will kill the grab/resizers
*/
flexifluid = {};
flexifluid.grid_name = 'Results_Table';
flexifluid.init = function()
{   
  /* Get base width to build percentages from */
   $('.bDiv').width('100%');
   var fullWidth = $('.bDiv').width();
   var tableWidth = $('.hDivBox table').width();

   /* Set Header to 100% */
   $('.hDiv').width('100%');
   $('.hDivBox').width('100%');
   $('.hDivBox table').width('100%');
   
  var col = 0;
  var minWidths = new Array();
  /* loop each header, reset width in % */
  $('.hDivBox th > div').each(function(){
      var pixWidth = $(this).width();
      var pWidth = parseInt((pixWidth / tableWidth) * 100);

      // Charles Treatman, 1/29/09:  Also set min-width in px
      // based on total width of contents (+1px to ensure no wrapping).
      var minWidth = 1;
      $('div', this).each(function(){
	minWidth += $(this).width();
      });

      $(this).width('100%');
      $(this.parentNode).width(pWidth + '%');
      $(this.parentNode).css('min-width', minWidth + 'px');

      minWidths[col] = minWidth;
      col++;
  });
  
  /* loop each content, reset width in % */
  var n = 0;  // keep track of how many total columns we've seen.
  $('#'+flexifluid.grid_name+' div').each(function(){
    var pixWidth = $(this).width();
    var pWidth = parseInt((pixWidth / tableWidth) * 100);
    $(this).width('100%');
    $(this.parentNode).width(pWidth + '%');
    // set the min-width for this column by looking up in
    // array of header min-width values.
    $(this.parentNode).css('min-width', minWidths[n % col]);
    n++;
  });

  /* Kill cDrag : will figure it out eventually*/ 
  $('.cDrag').hide();
  
  /* set Body to 100% */ 
  $('#'+flexifluid.grid_name).width('100%');
  /*
  flexifluid.screenPop();
  $(window).resize(function(){
    flexifluid.screenPop();
  });
  */
}

flexifluid.screenPop = function()
{
  $('.hDiv').width($('#'+flexifluid.grid_name).width());
}







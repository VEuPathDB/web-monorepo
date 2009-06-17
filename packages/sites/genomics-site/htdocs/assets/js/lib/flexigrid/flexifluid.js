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
  var pctWidths = new Array();
  var minWidths = new Array();
  /* loop each header, reset width in %
     make first calculation of min-width
     using table headers */
  $('.hDivBox th > div').each(function(){
      var pixWidth = $(this).width();
      var pWidth = parseInt((pixWidth / tableWidth) * 100);

      // Charles Treatman, 1/29/09:  Also set min-width in px
      // based on total width of contents (+5px to ensure no wrapping).
      var minWidth = 5;
      $('div', this).each(function(){
	minWidth += $(this).width();
      });

      $(this).width('100%');
      $(this.parentNode).width(pWidth + '%');
      
      pctWidths[col] = pWidth;
      minWidths[col] = minWidth;
      col++;
  });
  
  /* loop each content, reset width in %,
     attempt to refine min-width using
     table contents */
  // Create div for calculating word size
  var wordDiv = document.createElement('div');
  $(wordDiv).css({'position' : 'absolute',
                  'visibility' : 'hidden',
                  'height' : 'auto',
                  'width' : 'auto',
                  'font-size' : '100%'});
  $(wordDiv).attr('id', 'wordDiv');
  $("body").append(wordDiv);

  var n = 0;  // keep track of how many total cells we've seen.
  $('#'+flexifluid.grid_name+' div').each(function(){
    var pixWidth = $(this).width();
    $(this.parentNode).width(pctWidths[n % col] + '%');
    // attempt to refine min-width by splitting contents on
    // whitespace & calculating size of largest non-breakable
    // text for the current cell
    var words = $(this).text().replace(/^\s+|\s+$/g, '').split(/\s+/);
    for (var i = 0; i < words.length; ++i){
        $("#wordDiv").text(words[i]);
        var minWidth = $("#wordDiv").width() + 5;
        if (minWidth > minWidths[n % col])
   	    minWidths[n % col] = minWidth;
    }
    $(this).width('100%');
    n++;
  });

  // Remove div for calculating word size
  $("#wordDiv").remove();

  /* loop each header again to set min-width */
  col = 0;
  sum = 0; // for calculating min-width of container div
  $('.hDivBox th > div').each(function(){
      $(this).css('min-width', minWidths[col] + 'px');
      sum += minWidths[col];
      sum += (10 + 8 + 4); // account for padding & borders on table cells
      col++;
  });
  sum += (8 + 2); // account for padding & borders on table rows

  /* loop each content again to set min-width */
  n = 0;
  $('#'+flexifluid.grid_name+' div').each(function(){
      $(this).css('min-width', minWidths[n % col] + 'px');
      n++;
  });

  // Set min-width for container div for horizontal scrollbar
  $('.flexigrid').css('min-width', sum + 'px');

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







var fCount = 0;
var filesTable = '#fileSelTbl';

$(document).ready(function(){
  addFileSelRow();

  $('#uploadForm').validate({
    rules: {
      title: {
          required: true,
      },
    }
  });
  
  
  $('#newfile').click(function(){
    addFileSelRow();
  });

});
 
function addFileSelRow() {
  var remove = $("<td>").append($("<a>").
        attr("href", "javascript:void(0)").
           append($("<img>").attr("src", "images/remove.gif")
             .click(function(){  
                  removeRow($(this).parents("tr:last"));
             })
           ));

  $(filesTable).append(
    '<tr><td><table style="border:1px solid black;">' + 
    '<td>Select a file:</td>' +
    '<td><input name="file[' + fCount + ']" type="file" class="required" id="file[' + fCount + ']">' +
    '<td id="f_rm"></td>' +
    '</tr>' + 
    '<tr>' +
    '<td style="vertical-align:top">Brief Description:<br>(4000 max characters)</td>' +
    '<td colspan="2"><textarea name="notes[' + fCount + 
       ']" rows="3" cols="50" class="required" maxlength="4000" ></textarea></td>' +
    '</table></td></tr>'
  );


  if (fCount > 0) {
    var rowCount = $(filesTable).find("table").length;
    $(filesTable + ' tr:nth-child(' + (rowCount -1) + 
        ') table:first tr:first td:last').replaceWith(remove);
  }

//    $("file").rules("add", "required");

  zebraStripe();
  
  fCount++;
}

function zebraStripe() {
  $(filesTable + " table:odd").css("background-color", "#cccccc");
  $(filesTable + " table:even").css("background-color", "#ffffff");
}
function removeRow(row) {
  $(row).remove();
  zebraStripe(); 
}

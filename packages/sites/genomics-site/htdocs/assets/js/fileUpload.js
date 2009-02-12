var fCount = 0;
var fileTableName = 'fileSelTbl';

function addFileSelRow() {
  
  var fileSelTbl = document.getElementById(fileTableName);
  
  var selLabel = document.createTextNode('Select File:');

  var delEl = document.createElement('a');
  delEl.href = 'javascript:void(0)';
  delEl.onclick = function(){removeRow(this)};
  
  delImg = document.createElement('img');
  delImg.src = 'images/remove.gif';
  delImg.border = '0';
  
  delEl.appendChild(delImg);
  
  var fSelEl = document.createElement('input');
  fSelEl.type = "file";
  fSelEl.name = "file[" +  fCount +  "]";
  fSelEl.onchange = function(){addFileSelRow()};

  var newRow = fileSelTbl.insertRow(0);

  var cell0 = newRow.insertCell(0);
  cell0.appendChild(selLabel);

  var cell1 = newRow.insertCell(1);
  cell1.appendChild(fSelEl);
  cell1.style.align="center";

  var cell2 = newRow.insertCell(2);
  cell2.appendChild(document.createTextNode('\u00A0'));

  var lastCell = fileSelTbl.rows[0].cells.length - 1;  
  
  if (fileSelTbl.rows.length > 1) {
    var nCell = document.createElement('td');
        nCell.appendChild(delEl);
  
    fileSelTbl.rows[1].
          replaceChild(nCell,fileSelTbl.rows[1].cells[lastCell]);
  }  
  
  fCount++;
}

function removeRow(row) {
  var i = row.parentNode.parentNode.rowIndex;
  document.getElementById('fileSelTbl').deleteRow(i);
}

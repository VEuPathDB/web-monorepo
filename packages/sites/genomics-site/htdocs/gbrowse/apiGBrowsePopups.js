function table (rows) {
  return '<table border=0>' + rows.join('') + '</table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>';
}

// Gene title
function gene_title (tip, paramsString) {
  // split paramsString on semicolon
  var v = new Array();
  v = paramsString.split(';');
  
  var PROJECT_ID = 0;
  var SOURCE_ID = PROJECT_ID + 1;
  var CHR = SOURCE_ID + 1;
  var LOC = CHR + 1;
  var SO_TERM =  LOC + 1;
  var PRODUCT = SO_TERM + 1;
  var TAXON = PRODUCT + 1;
  var IS_PSEUDO =  TAXON + 1;

  // expand minimalist input data
  var cdsLink = "<a href=../../../cgi-bin/geneSrt?project_id=" + v[PROJECT_ID]
        + "&ids=" + v[SOURCE_ID]
        + "&type=CDS&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>CDS</a>"
  var proteinLink = "<a href=../../../cgi-bin/geneSrt?ids=" + v[SOURCE_ID]
        + "&type=protein&upstreamAnchor=Start&upstreamOffset=0&downstreamAnchor=End&downstreamOffset=0&go=Get+Sequences target=_blank>protein</a>"

  var type = (v[IS_PSEUDO] == '1')? v[SO_TERM] : v[SO_TERM] + " (pseudogene)";	
  var download = cdsLink + " | " + proteinLink;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Species:', v[TAXON]));
  rows.push(twoColRow('ID', v[SOURCE_ID]));
  rows.push(twoColRow('Gene Type', type));
  rows.push(twoColRow('Description', v[PRODUCT]));
  rows.push(twoColRow('Location', v[LOC]));
  rows.push(twoColRow('Download', download)); 

//  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'Annotated Gene ' + v[SOURCE_ID];
  return table(rows);
}


// EST title
function est (tip, paramsString) {
  // split paramsString on asterisk (to avoid library name characters)
  var v = new Array();
  v = paramsString.split('*');
  
  var ACCESSION = 0;
  var START = ACCESSION + 1;
  var STOP = START + 1;
  var PERC_IDENT = STOP + 1;
  var LIB =  PERC_IDENT + 1;

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('Accession:', v[ACCESSION]));
  rows.push(twoColRow('Location', v[START] + "-" + v[STOP]));
  rows.push(twoColRow('Identity', v[PERC_IDENT] + "%"));
  rows.push(twoColRow('Library', v[LIB]));

  tip.T_TITLE = 'EST ' + v[ACCESSION];
  return table(rows);
}


// SNP Title
function pst (tip, paramsString) {
  // split paramsString on comma
  var v = new Array();
  v = paramsString.split(',');

  var revArray = new Array();
  revArray['A'] = 'T';
  revArray['C'] = 'G';
  revArray['T'] = 'A';
  revArray['G'] = 'C';

  var POS_IN_CDS     = 0;
  var POS_IN_PROTEIN = POS_IN_CDS + 1; 
  var REF_STRAIN    = POS_IN_PROTEIN + 1; 
  var REF_AA        = REF_STRAIN + 1; 
  var REVERSED     = REF_AA + 1; 
  var REF_NA        = REVERSED + 1; 
  var SOURCE_ID     = REF_NA + 1; 
  var VARIANTS     = SOURCE_ID + 1; 
  var START        = VARIANTS + 1;
  var GENE         = START + 1; 
  var IS_CODING    = GENE + 1;
  var NON_SYN    = IS_CODING + 1;

  // expand minimalist input data
  var link = "<a href=/plasmo/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[SOURCE_ID] + ">" + v[SOURCE_ID] + "</a>";
 
  var type = 'Non-coding';
  var refNA = (v[REVERSED] == '1')? revArray[v[REF_NA]] : v[REF_NA];
  var refAAString = '';
  if (v[IS_CODING] == '1') {
    var non = (v[NON_SYN] == '1')? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[REF_AA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', v[START]));
  if (v[GENE] != '') rows.push(twoColRow('Gene', v[GENE]));
  if (v[IS_CODING] == '1') {
    rows.push(twoColRow('Position&nbsp;in&nbsp;CDS', v[POS_IN_CDS]));
    rows.push(twoColRow('Position&nbsp;in&nbsp;protein', v[POS_IN_PROTEIN]));
  }
  rows.push(twoColRow('Type', type));
  rows.push(twoColRow(v[REF_STRAIN] + '&nbsp;(reference)', 'NA=' + refNA + refAAString));  

  // make one row per SNP allele
  var variants = new Array();
  variants = v[VARIANTS].split('|');
  for (var i=0; i<variants.length; i++) {
    var variant = new Array();
    variant = variants[i].split(':');
    var strain = variant[0];
    var na = variant[1];
    if (v[REVERSED] == '1') na = revArray[na]; 
    var aa = variant[2];
    var info = 
     'NA=' + na + ((v[IS_CODING] == '1')? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    rows.push(twoColRow(strain, info));    
  }

//  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows);
}



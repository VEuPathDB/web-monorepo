function table (rows) {
  return '<table border=1>' + rows.join('') + </table>';
}

function twoColRow(left, right) {
  return '<tr><td>' + left + '</td><td>' + right + '</td></tr>;
}

// plasmodb SNP title
function pst (tip, paramsString) {
  // split paramsString on comma
  var v = new Array();
  v = paramsString.split(',');

  // indexes into the array formed by splitting paramsString
  const isCoding     = 0;
  const posInCDS     = isCoding + 1;
  const posInProtein = posInCDS + 1; 
  const refStrain    = posInProtein + 1; 
  const refAA        = refStrain + 1; 
  const gene         = refAA + 1; 
  const reversed     = gene + 1; 
  const refNA        = reversed + 1; 
  const nonSyn       = refNA + 1; 
  const sourceId     = nonSyn + 1; 
  const type         = sourceId + 1;
  const variants     = type + 1; 
  const start        = variants + 1;

  // expand minimalist input data
  var link = "<a href=/plasmo/showRecord.do?name=SnpRecordClasses.SnpRecordClass&primary_key=" + v[sourceId] + ">" + v[sourceId] + "</a>";
 
  var type = 'Non-coding';
  var refNA = v[isReversed]? reverse(v[refNA]) : v[refNA];
  var refAAString = '';
  if (v[isCoding]) {
    var non = v[nonSyn]? 'non-' : '';
    type = 'Coding (' + non + 'synonymous)';
    refAAString = '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + v[refAA];
  }

  // format into html table rows
  var rows = new Array();
  rows.push(twoColRow('SNP', link));
  rows.push(twoColRow('Location', start));
  if (v[gene] != '') rows.push(twoColRow('Gene', v[gene]));
  if (isCoding) {
    rows.push(twoColRow('Position in CDS', v[posInCDS]));
    rows.push(twoColRow('Position in Protein', v[posInProtein]));
  }
  rows.push(twoColRow('Type', type));
  rows.push(twoColRow(refStrain + ' (reference)', 'NA=' + refNA + refAAString));  

  // make one row per SNP allele
  var variants = new Array();
  variants = v[variants].split('|');
  for (var i=0; i<variants.length(); i++) {
    var variant = new Array();
    variant = variants[i].split(':');
    var strain = variant[0];
    var na = variant[1];
    if (v[isReversed]) na = reverse(na); 
    var aa = variant[2];
    var info = 
     'NA=' + na + (v[isCoding]? '&nbsp;&nbsp;&nbsp;&nbsp;AA=' + aa : '');
    rows.push(twoColRow(strain, info));    
  }

  tip.T_BGCOLOR = 'lightskyblue';
  tip.T_TITLE = 'SNP';
  return table(rows);
}



#########  Perl code  -- from .conf file  ################
#
# The sql code only formats one tag called 'params'
#
# this is what is returned:
#    onmouseover="return escape(pst(this, '1,302,22,Dd2,J,PF11_0344,0,A,1,PS-12221,Dd2:G:K|HB3:A:|Ghana:C:L,10010126'))
#
#
# and here is the perl code to format that
  sub snpTitle {
    my $f = shift;
    my $params = $f->get_tag_values("params")[0];
    my $variants = $f->bulkAttributes();
   
    my @vars;
    foreach my $variant (@$variants) {
      push(@vars, "$variant->{STRAIN}:$variant->{ALLELE}:$variant->{PRODUCT}";
    }
    my $varsString = join('|', @vars)
    return qq{onmouseover="return escape(pst(this,'$params,$varsString,$f->start'))"};
}



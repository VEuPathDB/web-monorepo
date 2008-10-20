<?
include_once "functions.php.inc";

$modinfo = parsePHPModules();
$apacheEnv = $modinfo['Apache Environment'];
$httpHeaders = $modinfo['HTTP Headers Information'];


printTable('HTTP Headers', $modinfo['HTTP Headers Information']);
print '<br>';
printTable('Apache Environment', $modinfo['Apache Environment']);
print '<br>';
printTable('Apache Internals', $modinfo['apache2handler']);

#phpinfo(8);



function printTable($title, $array) {
  print "<b>$title</b>:";
  $tabledef = "<table border='0' cellspacing='3' cellpadding='2' align=''>";
  print $tabledef;
  print "<tr class='secondary3'><th><font size='-2'>Attribute</font></th><th><font size='-2'>Value</font></th></tr>";
  $i = 0; foreach ($array as $key => $value) {
      if ($i++ % 2 == 0) { $rowStyle = 'rowLight'; } else { $rowStyle = 'rowMedium'; }
      if ($key == 'Directive') {
          print "</table><table border='0' cellspacing='3' cellpadding='2' align=''>";
      }
      print "<tr class='$rowStyle'><td>$key</td>";
      if (is_array($value)) { 
          $value = implode("</td><td>", $value);
          print "<td>$value</td></tr>  ";
      } else {
          print "<td>$value</td></tr>  ";
      }
  }
  print "</table>";
}
?>
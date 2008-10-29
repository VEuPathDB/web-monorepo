<?
include_once "functions.php.inc";

$modinfo = parsePHPModules();
$apacheEnv = $modinfo['Apache Environment'];
$httpHeaders = $modinfo['HTTP Headers Information'];
$upstreamServer = upstreamServer();

?>
<h2>Apache HTTP Server</h2>

<? print $proxyNotice ?>
<p>
<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('httpheaders','blind'); return false">HTTP Headers &#8593;&#8595;</a></b>
<div id="httpheaders" style="padding: 5px; display: none;"><div>
<? printTable($modinfo['HTTP Headers Information']); ?>
</div></div>

<p>

<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('apacheenv','blind'); return false">Apache Environment &#8593;&#8595;</a></b>
<div id="apacheenv" style="padding: 5px; display: none;"><div>
<? printTable($modinfo['Apache Environment']); ?>
</div></div>

<p>

<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('apachehandler','blind'); return false">Apache Internals &#8593;&#8595;</a></b>
<div id="apachehandler" style="padding: 5px; display: none;"><div>
<? printTable($modinfo['apache2handler']); ?>
</div></div>


<?

function printTable($array) {
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
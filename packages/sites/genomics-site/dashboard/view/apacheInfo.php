<?php
/**
 * Information about the Apache HTTP Server environment.
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/ApacheInfo.php";

$ai = new ApacheInfo();

?>

<h2>Apache HTTP Server</h2>

<p class="smalltext"><span class="expand_all clickable smalltext">expand all</span> | <span class="collapse_all clickable smalltext">collapse all</span></p>

<p>
<p class="clickable">HTTP Headers &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">
<? printTable($ai->get('HTTP Headers Information')); ?>
</div>


<p>

<p class="clickable">Apache Environment &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">
<? printTable($ai->get('Apache Environment')); ?>
</div>

<p>

<p class="clickable">Apache Internals &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">
<? printTable($ai->get('apache2handler')); ?>
</div>


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

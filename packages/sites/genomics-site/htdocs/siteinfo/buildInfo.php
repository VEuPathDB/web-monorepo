<?
include_once "functions.php.inc";

try {
    $build = parse_properties($_SERVER['GUS_HOME'] . '/config/.build.info');
} catch (Exception $e) {
    echo 'Exception: ',  $e->getMessage(), "\n";
    return;
}
?>

<h2>Build State</h2>
<p>
Last build  was a '<b><?= $build['!Last.build.component']?></b> 
<b><?=$build['!Last.build.initialTarget']?></b>' 
on <b><?=$build['!Last.build.timestamp']?></b>
<a href='javascript:void()' style="text-decoration:none"
    onmouseover="return overlib('A given build may not refresh all project components. ' + 
    'For example, a \'ApiCommonData/Model install\' does not build any WDK code.<br>' +
    'See Build Details for a cumulative record of past builds.')"
    onmouseout = "return nd();"><sup>[?]</sup></a>

  <br>

<b><a href="#" style="text-decoration:none" 
    onclick="Effect.toggle('buildtime','blind'); return false">
Component Build Details &#8593;&#8595;</a></b>

<div id="buildtime" style="padding: 5px; display: none"><div>
<font size='-1'>A given build may not refresh all project components.<br>
The following is a cummulative record of past builds.</font>

<table border="0" cellspacing="3" cellpadding="2">
<tr class="secondary3">
<th align="left"><font size="-2">component</font></th>
<th align="left"><font size="-2">build time</font></th>
</tr>
<?
/** 
  example prop: ApiCommonShared.Model.buildtime
  1. sort
  2. list only *.buildtime props
  3. remove '.buildtime'
  4. sub '.' with '/'
**/
$i = 0;
ksort($build);
foreach ($build as $p => $v) {
    if ($trunc = strpos($p, '.buildtime')) {
        $p = str_replace('.', '/', substr($p, 0, $trunc));
        if ($i % 2) {
           print '<tr class="rowMedium">';
        } else {
           print '<tr class="rowLight">';
        }
        print "<td><pre>$p</pre></td>";
        print "<td><pre>$v</pre></td>";
        print "</tr>\n";
        $i++;
    }
}
?>
</table>
  
</div></div>

<p>

<b><a href="#" style="text-decoration:none" onclick="Effect.toggle('svnstate','blind'); return false">
Svn Working Directory State &#8593;&#8595;</a></b>

<div id="svnstate" style="padding: 5px; display: none"><div>
<font size='-1'>State at build time. Uncommitted files are highlighted. Files may have been committed
since this state was recorded.</font>

<table class='p' border='1' cellspacing='0'>
<?
/** 
  example prop: 
        ApiCommonWebService.svn.info
    and, if uncommited changes, 
        ApiCommonWebService.svn.status
**/
$i = 0;
ksort($build);
foreach ($build as $p => $v) {
    if (($trunc = strpos($p, '.svn.')) && $v != '' && $v != 'NA') {
        $bgcolor = '';
        if (strpos($p, '.svn.status')) {
            # has uncommited changes; highlight background 
            $bgcolor = 'bgcolor="#FFFF99"';
            $key = str_replace('.', '/', str_replace('.svn.status', ' status', $p));
        } else {
            $key = str_replace('.', '/', substr($p, 0, $trunc));            
        }
        
        print "<tr $bgcolor>";
        print "<td><pre>$key</pre></td>";
        print "<td><pre>$v</pre></td>";
        print "</tr>\n";
    }
}
?>
</table>

      
<p>
Use the following commands from within your $PROJECT_HOME to switch it to match this site.
</p>
<table class='p' border='1' cellspacing='0' cellpadding='5'>
<tr><td class='monospaced'>
<?
foreach ($build as $p => $v) {
    if ($trunc = strpos($p, '.svn.info')) {
        $start = strpos($v, 'Revision: ') + strlen('Revision: ');
        $end = strpos($v, 'Last Changed Rev: ') - $start;
        $svnrevision = trim(substr($v, $start, $end));

        $start = strpos($v, 'URL: ') + strlen('URL: ');
        $end = strpos($v, 'Revision: ') - $start;
        $svnbranch = trim(substr($v, $start, $end));
        
        $svnproject = str_replace('.', '/', substr($p, 0, $trunc));
        

        print "svn switch -r$svnrevision $svnbranch $svnproject;<br>";
    }
}
?>
</td></tr>
</table>

</div></div>

<?php
/**
 * Information about the project build.
 *
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/BuildInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/StageValues.php";

$build_info = new BuildInfo();
$build = $build_info->get_data_map();

$stage_values = new StageValues();
$flipped_stages = $stage_values->get_flipped_data_map();
$stages = $stage_values->get_data_map();
?>

<h2>Website Stage</h2>

<?php
$stage_value = getenv('WEBSITE_RELEASE_STAGE');

if ($stage_value) {
  print '<p>';
  print "<b>Website Release Stage:</b> " . $flipped_stages[$stage_value] . ' (' . $stage_value . ')';
  print '</p>';
  
  if (isset($_COOKIE["website_release_stage"])) {
    print "<p class='warn'>The default stage for this site is overridden for this browser session by the cookie '<b>website_release_stage</b>' and may differ 
    from the actual stage. Delete this cookie or restart your browser to revert to the default.</p>";
  }

  /**  
  // only development sites can change their stage on the fly
  if ($stage_value == $stages['DEVELOPMENT'] || isset($_COOKIE["website_release_stage"])) {
    print "<p><a href='set_website_release_stage_70'>change</a></p>";
  }
  */
} else {
  print "The 'WEBSITE_RELEASE_STAGE' environment variable is not set.";
}

 ?>
<h2>Build State</h2>
<p>
  Last build  was for '<b><?php print $build_info->get('!Last.build.component') ?></b>
  <b><?php print $build_info->get('!Last.build.initialTarget') ?></b>'
  on <b><?php print $build_info->get('!Last.build.timestamp') ?></b>
  <a href='javascript:void()' style="text-decoration:none"
     onmouseover="return overlib('A given build may not refresh all project components. ' +
         'For example, a \'ApiCommonData/Model install\' does not build any WDK code.<br>' +
         'See Build Details for a cumulative record of past builds.')"
     onmouseout = "return nd();"><sup>[?]</sup></a>

<p>

<p><i>
Subversion working directories are recorded at build time. An incomplete build will result in an incomplete list. 
Any subversion working directories in project_home that are not defined as dependencies in the GUS/Ant build will not be listed.
</i></p>

<p class="clickable">Component Build Details &#8593;&#8595;</p>

<div class="expandable" style="padding: 5px;">
  <font size='-1'>A given build may not refresh all project components.<br>
  The following is a cummulative record of past builds.</font>

  <table border="0" cellspacing="3" cellpadding="2">
    <tr class="secondary3">
      <th align="left"><font size="-2">component</font></th>
      <th align="left"><font size="-2">build time</font></th>
    </tr>
    <?php
    /**
      example prop: ApiCommonShared.Model.buildtime
      1. sort
      2. list only *.buildtime props
      3. remove '.buildtime'
      4. sub '.' with '/'
     * */
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

</div>

<p>

<p class="clickable">Svn Working Directory State &#8593;&#8595;</p>

<div class="expandable" style="padding: 5px;">
  <font size='-1'>State at build time. Uncommitted files are highlighted. Files may have been committed
  since this state was recorded.</font>

  <table class='p' border='1' cellspacing='0'>
    <?php
    /**
      example prop:
      ApiCommonWebService.svn.info
      and, if uncommited changes,
      ApiCommonWebService.svn.status
     * */
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
</div>

<script>
  $(function() { 
    $( "#content_tabs" ).tabs(
      {
        select: function(event, ui) {
          if (ui.index == 0) {
            $( "#svn-state-txt" ).html('Run the following curl command from within your \
            $PROJECT_HOME to switch it to match this site.<br/>\
            <code>curl -s <?php print $_SERVER['SERVER_NAME'] ?>/dashboard/xml/svn/switch/value | /bin/sh</code>');
          } else if (ui.index == 1) {
            $( "#svn-state-txt" ).html('Run the following curl command from within your \
            $PROJECT_HOME to checkout code to match this site.<br/>\
            <code>curl -s <?php print $_SERVER['SERVER_NAME'] ?>/dashboard/xml/svn/checkout/value | /bin/sh</code>');
          }
        }
      }
    );
  });
</script>
<div id="svnswitch" style="padding-left:10px;">
  <b>Subversion State Matching</b>
  <p id='svn-state-txt'>
    Run the following command from within your $PROJECT_HOME to switch it to match this site.<br>
    <code>curl -s <?php print $_SERVER['SERVER_NAME'] ?>/dashboard/xml/svn/switch/value | /bin/sh</code>
  </p>
  <table class='p' border='1' cellspacing='0' cellpadding='0'>
    <tr><td class='rowLight'>        
        <div id="content_tabs">
          <ul>
            <li><a href="#tab-svn-switch">switch</a></li>
            <li><a href="#tab-svn-checkout">checkout</a></li>
          </ul>
          <div id="tab-svn-switch">
                <?php
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
          </div>
          <div id="tab-svn-checkout">
                <?php
                foreach ($build as $p => $v) {
                  if ($trunc = strpos($p, '.svn.info')) {
                    $start = strpos($v, 'Revision: ') + strlen('Revision: ');
                    $end = strpos($v, 'Last Changed Rev: ') - $start;
                    $svnrevision = trim(substr($v, $start, $end));
        
                    $start = strpos($v, 'URL: ') + strlen('URL: ');
                    $end = strpos($v, 'Revision: ') - $start;
                    $svnbranch = trim(substr($v, $start, $end));
        
                    $svnproject = str_replace('.', '/', substr($p, 0, $trunc));
        
        
                    print "svn checkout -r$svnrevision $svnbranch $svnproject;<br>";
                  }
                }
                ?>
          </div>
        </div>
    </td></tr>
  </table>
</div>

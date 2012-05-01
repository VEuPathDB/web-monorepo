<?php

require_once dirname(__FILE__) . "/../lib/modules/ModelConfigInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/CommentConfigInfo.php";
require_once dirname(__FILE__) . "/../lib/modules/WdkPropertiesInfo.php";

$model_config = new ModelConfigInfo();
$comment_config = new CommentConfigInfo();
$properties_config = new WdkPropertiesInfo();

$model_data_tree = $model_config->get_data_tree();
$comment = $comment_config->get_data_map();
$properties = $properties_config->get_data_map();
?>

<h2>Configuration</h2>

<p class="smalltext"><span class="expand_all clickable smalltext">expand all</span> | <span class="collapse_all clickable smalltext">collapse all</span></p>

<p class="clickable">WDK Model Configuration &#8593;&#8595;</p> 
<div class="expandable" style="padding: 5px;">
        The following configurations were obtained from the WDK's running instance of the ModelConfig* classes. These generally represent values defined in 
        the <code>model-config.xml</code> <i>at the time the webapp was loaded</i>,
        although some properties shown may have been added by the WDK's internals. Passwords have been masked in this display.<br>
        <i>This information is </i><b>not</b><i> suitable for 
        copying directly into the model-config.xml as the attribute names shown here may not match the RNG spec.</i>

<pre>
<?
ksort($model_data_tree);
foreach ($model_data_tree as $section => $data) {
  print "<b>" . $section . "</b><blockquote>" ;
  ksort($data);
  foreach ($data as $k => $v) {
    print $k . " = " . htmlentities($v) . "\n";
  }
  print "</blockquote>";
}
?>
</pre>


</div>


<p class="clickable">WDK Comments Configuration &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">

<p>
The following configurations were obtained from the WDK's running instance of the CommentConfig class. These generally represent values set in 
<code>comment-config.xml</code> although some processing may occur by the WDK parser.
The CommentConfig class is instantiated on the first page access requiring it (e.g. this page or the showAddComment.do action) - not at webapp load time. Passwords have been masked in this display.<br>
<i>This information is </i><b>not</b><i> suitable for  copying directly into the comment-config.xml as the attribute names shown here may not match the RNG spec.</i>
</p>
<pre>
<?
ksort($comment);
foreach ($comment as $k => $v) {
  print $k . " = " . $v . "\n";
}
?>
</pre>    
</div>

<p class="clickable">WDK Properties &#8593;&#8595;</p>
<div class="expandable" style="padding: 5px;">

<p>
WDK built-in properties and properties defined in 
the <code>model.prop</code> <i>at the time the webapp was loaded</i>.
</p>
<pre>
<?
ksort($properties);
foreach ($properties as $k => $v) { 
  print $k . " = " . htmlentities($v) . "\n";
}
?>
</pre>    
</div>
</p>

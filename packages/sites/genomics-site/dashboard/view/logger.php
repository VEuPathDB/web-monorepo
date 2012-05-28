<?php
/**
 * Information about log4j levels.
 * @package View
 */

require_once dirname(__FILE__) . "/../lib/modules/Logger.php";

$log_manager = new Logger();


if ($_SERVER['REQUEST_METHOD'] == "POST" &&
        array_key_exists('logger_name', $_POST)) {

  $logger_map = array();
  foreach ($_POST['logger_name'] as $name) {
    $logger_map{$name} = $_POST['logger_level'];
  }

  $success = $log_manager->update($logger_map);
  if (!$success)
    print "<font color='red'>ERROR applying updates</font>";
}


$log_data = $log_manager->attributes();

$select_opts = "";

ksort($log_data);
foreach ($log_data as $logger => $level) {
  $select_opts .= '<option value="' . $logger . '">' . $logger . ' [' . $level . ']' . '</option>';
}
?>

<form method="POST">
  <table cellpadding="5" cellspacing="0" border="1">
    <tr>
      <td colspan="2">
        <h2>
          Alter Log Levels
        </h2>
      </td>
    </tr>
    <tr>
      <td>Choose Logger:<br>
        <font size="-1">Format: LoggerClass [Current Level]</font><br>
        <select name='logger_name[]' multiple="" size='20'>
          <?= $select_opts ?>
        </select>
      </td>
      <td>Choose Level:<br>
        <select name='logger_level'>
          <option value="ALL">All</option>
          <option value="DEBUG">Debug</option>
          <option value="ERROR">Error</option>
          <option value="FATAL">Fatal</option>
          <option value="INFO">Info</option>
          <option value="OFF">Off</option>
          <option value="WARN">Warn</option>
        </select>
      </td>
    </tr>
    <tr>
      <td colspan="2">
        <input type="Submit" name='Submit' value='Apply Changes'>
      </td>
    </tr>
  </table>
</form>

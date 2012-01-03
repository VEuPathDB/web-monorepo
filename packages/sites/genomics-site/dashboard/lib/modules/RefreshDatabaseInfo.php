<?

// This needs to be moved into DatabaseInfo.php once that module is refactored
// so the constructor doesn't do all the work.
require_once dirname(__FILE__) . "/JmxModule.php";

class RefreshDatabaseInfo extends JmxModule {

  var $mbean_path;

  function get_params($domain, $mbean_path, $context, $attribute) {
    $domain = 'org.apidb.wdk';
    
    return array(
        array(
            'type' => 'exec',
            'mbean' => "$domain:group=Databases,type=AppDB,context=$context",
            'operation' => 'refresh',
        ),
        array(
            'type' => 'exec',
            'mbean' => "$domain:group=Databases,type=UserDB,context=$context",
            'operation' => 'refresh',
        )
      );
    }

  /** override parent method so we get data from the right
      array index 
  **/
  function get_result_value($json_response) {
    return $json_response[0]{'value'};
  }


  // must set $mbean_path for superclass, even though we aren't using it.
  // TODO: refactor so this is not required.
  public function get_mbean_path() {
    return '';
  }

}
?>

<?
require_once dirname(__FILE__) .  "/../../functions.php.inc";

class BuildInfo {

  function __construct() {

    try {
        $this->data_map = parse_properties($_SERVER['GUS_HOME'] . '/config/.build.info');
    } catch (Exception $e) {
        echo 'Exception: ',  $e->getMessage(), "\n";
        return;
    }

  }

  /**
    Return value for given key
  **/
  function get($key) {
    if (array_key_exists($key, $this->data_map)) {
      return $this->data_map{$key};
    }
    return null;
  }

  function get_data_map() {
    return $this->data_map;
  }


}

?>
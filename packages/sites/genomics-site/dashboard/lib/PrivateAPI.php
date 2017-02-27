<?php

require_once dirname(__FILE__) . "/modules/Database.php";
require_once dirname(__FILE__) . "/modules/WdkProperties.php";
require_once dirname(__FILE__) . "/modules/ModelConfig.php";
require_once dirname(__FILE__) . "/modules/CommentConfig.php";
require_once dirname(__FILE__) . "/modules/BuildInfo.php";
require_once dirname(__FILE__) . "/modules/ProxyInfo.php";
require_once dirname(__FILE__) . "/modules/WdkMeta.php";
require_once dirname(__FILE__) . "/modules/Webapp.php";
require_once dirname(__FILE__) . "/modules/Jvm.php";
require_once dirname(__FILE__) . "/modules/WdkCache.php";
require_once dirname(__FILE__) . "/LdapTnsNameResolver.php";

/**
 * Description of PrivateAPI
 *
 * @author Mark Heiges <mheiges@uga.edu>
 *
 * @package Utility
 * @subpackage Core
 */
class PrivateAPI {

  var $api_dataset;

  public function __construct() {
    $this->init();
  }

  private function init() {
    $this->api_dataset = array();

    $app_database = new Database('APP');
    $adb_attr = $app_database->attributes();

    $user_database = new Database('USER');
    $udb_attr = $user_database->attributes();

    $wdk_properties = new WdkProperties();
    $wdk_properties_attr = $wdk_properties->attributes();

    $model_config = new ModelConfig();
    $model_config_attr = $model_config->attributes();

    $comment_config = new CommentConfig();
    $comment_config_attr = $comment_config->attributes();

    $wdk_meta = new WdkMeta();
    $wdk_meta_attr = $wdk_meta->attributes();

    $webapp = new Webapp();
    $webapp_attr = $webapp->attributes();

    $jvm = new Jvm();
    $jvm_attr = $jvm->attributes();

    $cache = new WdkCache();
    $cache_attr = $cache->attributes();

    $build = new BuildInfo();
    $proxy = new ProxyInfo();
    $proxy_attr = $proxy->attributes();

    $ldap_resolver = new LdapTnsNameResolver();

    $all_data = array(
        'proxy' => array(
            'proxyapp' => $proxy_attr{'proxy_app'},
            'proxyhost' => $proxy_attr{'proxy_host'},
            'upstreamhost' => $proxy_attr{'upstream_server'},
        ),
        'wdk' => array(
            'modelname' => $wdk_meta_attr{'DisplayName'},
            'modelversion' => $wdk_meta_attr{'ModelVersion'},
            'buildnumber' => $wdk_meta_attr{'BuildNumber'},
            'databases' => array(
                'appdb' => array(
                    'servicename' => $adb_attr{'service_name'},
                    'instancename' => $adb_attr{'instance_name'},
                    'globalname' => $adb_attr{'global_name'},
                    'dbuniquename' => $adb_attr{'db_unique_name'},
                    'servername' => $adb_attr{'server_name'},
                    'sizeondisk' => $adb_attr{'dbf_gb_on_disk'},
                    'aliases' => $this->array_to_map($ldap_resolver->resolve($adb_attr{'service_name'}), 'alias'),
                ),
                'userdb' => array(
                    'servicename' => $udb_attr{'service_name'},
                    'instancename' => $udb_attr{'instance_name'},
                    'globalname' => $udb_attr{'global_name'},
                    'servername' => $udb_attr{'server_name'},
                    'sizeondisk' => $udb_attr{'dbf_gb_on_disk'},
                    'aliases' => $this->array_to_map($ldap_resolver->resolve($udb_attr{'service_name'}), 'alias'),
                )
            ),
            'querycache' => array(
                'enabled' => ($cache_attr{'WdkIsCaching'}) ? 'true' : 'false',
                'tablecount' => $cache_attr{'cache_table_count'},
             ),
            'modelconfig' => $this->normalize_keys_in_array($model_config_attr),
            'commentconfig' => $this->normalize_keys_in_array($comment_config_attr),
            'modelprop' => $this->normalize_keys_in_array($wdk_properties_attr),
        ),
        'tomcat' => array(
            'webapp' => $this->webapp_from_context($webapp_attr{'path'}),
            'webappstarttime' => $webapp_attr{'startTime'},
            'webappstarttext' => $webapp->uptime_as_text(),
            'instance'  => $jvm_attr{'SystemProperties'}{'instance.name'},
            'instancestarttime'  => $jvm_attr{'Uptime'},
            'instancestarttext'  => $jvm->uptime_as_text(),
        ),
        'svn' => $this->init_svn_info($build->get_data_map()),
        'vmenv' => $this->virtual_machine_environment_settings(
              $wdk_meta_attr, $wdk_properties_attr, $webapp_attr, $adb_attr),
    );

    $this->api_dataset = array_merge($this->api_dataset, $all_data);
  }

  /**
   * Split an one dimensional list array into a multidimensional map array using the given key.
   * input 
   *       array('cryp-inc', 'crypbl2n')
   * becomes
   *       array(
   *         array( 'alias' => 'cryp-inc'),
   *         array( 'alias' => 'crypbl2n')
   *       )
   *
   * @param $array  array to split
   * @param $key key value for each array
   * @return array
   *
   */
  private function array_to_map($array, $key) {
    $map = array();
    foreach ($array as $v) {
      array_push($map, array($key => $v));
    }
    return $map;
  }
  
  /**
   * Split a string into a multidimensional array using the given key.
   *
   * array(
   *   array( 'alias' => 'cryp-inc'),
   *   array( 'alias' => 'crypbl2n')
   * )
   *
   * @param $string  string to split
   * @param $pattern regex to split on
   * @param $key key value for each array
   * @return array
   *
   */
  private function split_to_map($string, $pattern, $key) {
    $map = array();
    $values = preg_split($pattern, $string);
    foreach ($values as $v) {
      array_push($map, array($key => $v));
    }
    return $map;
  }

  /**
   * lowercase and remove '_' from array keys
   *
   * @param array
   * @return array
   */
  private function normalize_keys_in_array($in_array) {
    $to_array = array();
    foreach ($in_array as $k => $v) {
      if (is_array($v)) {
        $to_array[strtolower(str_replace('_', '', $k))] = $this->normalize_keys_in_array($v);
      } else {
        $to_array[strtolower(str_replace('_', '', $k))] = $v;
      }
    }
    return $to_array;
  }

  /**
   * Restructures and formats subversion data that was extracted
   * from the GUS .build.info properties file via the BuildInfo class.
   * @see BuildInfo
   *
   * @param array build data
   * @return array
   */
  private function init_svn_info($build) {
    $array = array(
        'locations' => array(),
        'switch' => '',
        'checkout' => '',
    );

    $switch_stmts = null;
    $checkout_stmts = null;

    foreach ($build as $prop => $data) {
      if (strpos($prop, '.svn.info')) {
        $info = $this->svninfo_from_build_data($prop, $data);
        if ($info === NULL) {
          // return empty array so any piping to a shell is a noop
          return $array;
        } else {
          $svnbranch = $info['URL'];
          $svnproject = $info['Working Directory'];
          $svnrevision = $info['Revision'];
          array_push($array{'locations'}, array('location' => array(
                  'remote'   => $svnbranch,
                  'local'    => $svnproject,
                  'revision' => $svnrevision
              )
                  )
          );

          $switch_stmts .= "svn switch -r$svnrevision $svnbranch $svnproject;\n";
          $checkout_stmts .= "svn checkout -r$svnrevision $svnbranch $svnproject;\n";
        }
      }
    }
    $array{'switch'} = $switch_stmts;
    $array{'checkout'} = $checkout_stmts;
    return $array;
  }

  /**
   * bash shell variable assignments to aid virtual machine setup
   */
/**U=abarreto
PRODUCT=PlasmoDB
WEBAPP=plasmo.b19
HOST=sa.plasmodb.org
RELEASE_NUMBER=10.0
LOGIN=plasmodbwww
BUILD_NO=19
**/
  private function virtual_machine_environment_settings(
        $wdk_meta_attr, $wdk_properties_attr, $webapp_attr, $adb_attr) {

    $webapp = $this->webapp_from_context($webapp_attr{'path'});

    # webapp names on VMs should be of the form toxo.b12, where '12' is the build
    # number. So strip any existing extension and add '.b12'.
    $webapp_base = preg_replace('/\..*/', '', $webapp);
    $webapp_for_vm = $webapp_base . '.b' . $wdk_meta_attr{'BuildNumber'};

    // e.g. get TLD plasmodb.org from qa.plasmodb.org
    preg_match("/[^\.\/]+\.[^\.\/]+$/", $_SERVER['SERVER_NAME'], $matches);
    $tld = @$matches[0];

    $env = '';
    $env .= 'PRODUCT=' . $wdk_properties_attr{'PROJECT_ID'} . "\n";
    $env .= 'HOST=' . 'sa.' . $tld . "\n";
    $env .= 'WEBAPP=' . $webapp_for_vm . "\n";
    $env .= 'RELEASE_NUMBER=' . $wdk_meta_attr{'ModelVersion'} . "\n";
    $env .= 'APPDB_LOGIN=' . strtolower($adb_attr{'login'}) . "\n";
    $env .= 'BUILD_NUMBER=' . $wdk_meta_attr{'BuildNumber'} . "\n";
    return $env;
  }

  // Given '/toxo.b1' return 'toxo.b1' (strip the leading slash)
  private function webapp_from_context($context) {
    $webapp = substr($context, 1);
    $webapp = ($webapp == '') ? 'ROOT' : $webapp;
    return $webapp;
  }
  
  /**
   * Returns full data set as XML
   *
   * @return \DomDocument
   */
  public function get_xml() {
    $xml = new DomDocument('1.0');
    $xml->preserveWhiteSpace = false;
    $load = $xml->loadXML($this->to_xml($this->api_dataset, 'foos'));
    return $xml;
  }

  /**
   *
   * @param type $array
   * @param type $root
   * @return string XML
   */
  private function to_xml($array, $root) {
    $xml_o = new SimpleXMLElement("<?xml version=\"1.0\"?><$root></$root>");
    $this->array_to_xml($array, $xml_o);
    return $xml_o->asXML();
  }

  /**
   * Transforms array to XML
   *
   * @param array $array
   * @param string $xml_o
   */
  private function array_to_xml($array, &$xml_o) {
    foreach ($array as $key => $value) {
      if (is_array($value)) {
        if (!is_numeric($key)) {
          $subnode = $xml_o->addChild("$key");
          $this->array_to_xml($value, $subnode);
        } else {
          $this->array_to_xml($value, $xml_o);
        }
      } else {
        // htmspecialchars() because SimpleXMLElement doesn't escape ampersands
        $xml_o->addChild("$key", htmlspecialchars("$value"));
      }
    }
  }

  /**
   * Returns JSON encoding of the full data set
   *
   * @return string JSON
   */
  public function to_json() {
    return json_encode($this->api_dataset);
  }

  private function svninfo_from_build_data($prop, $data) {
    if ($end_of_proj_name = strpos($prop, '.svn.info')) {
      # $prop matches '.svn.info'. $data, e.g. is:
      #    Path: ApiCommonShared
      #    Working Copy Root Path: /var/www/AmoebaDB/amoeba.integrate/project_home/ApiCommonShared
      #    URL: https://www.cbil.upenn.edu/svn/apidb/ApiCommonShared/trunk
      #    Relative URL: ^/ApiCommonShared/trunk
      #    Repository Root: https://www.cbil.upenn.edu/svn/apidb
      #    Repository UUID: 735e2a04-f8fc-0310-8a1b-f2942603c481
      #    Revision: 67558
      #    Node Kind: directory
      #    Schedule: normal
      #    Last Changed Author: crouchk
      #    Last Changed Rev: 67525
      #    Last Changed Date: 2015-04-24 11:33:36 -0400 (Fri, 24 Apr 2015)
      #
      # Split that on newlines...
      $infoset = explode("\n", $data);
      foreach ($infoset as $attr) {
        if (strlen($attr) == 0) { continue; }
        # $attr is of the form
        #     Path: ApiCommonShared
        # and
        #     URL: https://www.cbil.upenn.edu/svn/apidb/ApiCommonShared/trunk
        # etc. 
        # Split each of those by ':' (with a array lenght limit of '2'
        # so we don't split on the colons in the url or timestamps).
        $pairs = explode(':', $attr, 2);
        # That should create a two element array. Combine those
        if (count($pairs) == 2) {
          $info[$pairs[0]] = trim($pairs[1]);
        } else {
          return NULL;
        }
      }
      # Extract the working directory name from the $prop . e.g.
      # strip off '.svn.info'.
      #   EuPathSiteCommon.svn.info
      # becomes
      #   EuPathSiteCommon
      $info['Working Directory'] = str_replace('.', '/', substr($prop, 0, $end_of_proj_name));
      return $info;
    }
  }

}

?>

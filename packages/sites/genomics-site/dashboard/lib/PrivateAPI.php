<?
/**
  This class aggregates data into an array for exposure in a programming API as
  json or xml .
  
  This is intended for use in secure environments as the attributes exposed may
  be sensitive.
  
  It controls which attributes are exposed and handles any attribute renaming.
**/
require_once dirname(__FILE__) . "/modules/WdkMetaMbean.php";
require_once dirname(__FILE__) . "/modules/UserDatabaseInfo.php";
require_once dirname(__FILE__) . "/modules/AppDatabaseInfo.php";
require_once dirname(__FILE__) . "/modules/WdkPropertiesInfo.php";
require_once dirname(__FILE__) . "/modules/ModelConfigInfo.php";
require_once dirname(__FILE__) . "/modules/CommentConfigInfo.php";
require_once dirname(__FILE__) . "/modules/BuildInfo.php";
require_once dirname(__FILE__) . "/modules/ProxyInfo.php";

class PrivateAPI {

  var $api_dataset;
  
  function __construct() {
    $this->init();
  }

  function init() {
    $this->api_dataset = array();

    $wdk_meta_mbean = new WdkMetaMbean();
    $adb = new AppDatabaseInfo();
    $udb = new UserDatabaseInfo();
    $properties = new WdkPropertiesInfo();
    $model_config = new ModelConfigInfo();
    $comment_config = new CommentConfigInfo();
    $build = new BuildInfo();
    $proxy = new ProxyInfo();

    $all_data = array('wdk' =>
      array(
        'proxy'             => array(
          'proxyapp'           => $proxy->get('proxy_app'),
          'proxyhost'          => $proxy->get('proxy_host'),
          'upstreamhost'       => $proxy->get('upstream_server'),
        ),
        'modelname'         => $wdk_meta_mbean->get('DisplayName'),
        'modelversion'      => $wdk_meta_mbean->get('ModelVersion'),
        'databases'         => array(
          'appdb'             => array(
            'servicename'        => $adb->get('service_name'),
            'instancename'       => $adb->get('instance_name'),
            'globalname'         => $adb->get('global_name'),
            'aliases'            => $this->split_to_array($adb->get('aliases_from_ldap'), '/,\s*/', 'alias'),
          ),
          'userdb'           => array(
            'servicename'        => $udb->get('service_name'),
            'instancename'       => $udb->get('instance_name'),
            'globalname'         => $udb->get('global_name'),
            'aliases'            => $this->split_to_array($udb->get('aliases_from_ldap'), '/,\s*/', 'alias'),
          )
        ),
        'modelconfig'       => $this->normalize_keys_in_array($model_config->re_section_data()),
        'commentconfig'     => $this->normalize_keys_in_array($comment_config->get_data_map()),
        'modelprop'         => $this->normalize_keys_in_array($properties->get_data_map()),
        'svn'               => $this->init_svn_info($build->get_data_map()),
      )
    );

    $this->api_dataset = array_merge($this->api_dataset, $all_data);
  }

  /**
    Split a string into a multidimensional array using the given key.
        split_to_array('cryp-inc,crypbl2n', '/,/', 'alias')
    Returns
        array(
           array( 'alias' => 'cryp-inc'),
           array( 'alias' => 'crypbl2n')
       )
  **/
  function split_to_array($string, $pattern, $key) {
    $array = array();
    $values = preg_split($pattern, $string);
    foreach ($values as $v) {
      array_push($array, array($key => $v));
    }
    return $array;
  }

  /**
   lowercase and remove '_' from array keys (first dimension only)
  **/
  function normalize_keys_in_array($prop) {
    $array = array();
    foreach ($prop as $k => $v) {
      array_push($array, array(str_replace('_', '', strtolower($k)) => $v));
    }
    return $array;
  }
  
  function init_svn_info($build) {
    $array = array(
               'locations' => array(),
               'switch'    => '',
             );

    $switch_stmts = null;
    
    foreach ($build as $p => $v) {
      if ($trunc = strpos($p, '.svn.info')) {
          $start = strpos($v, 'Revision: ') + strlen('Revision: ');
          $end = strpos($v, 'Last Changed Rev: ') - $start;
          $svnrevision = trim(substr($v, $start, $end));
  
          $start = strpos($v, 'URL: ') + strlen('URL: ');
          $end = strpos($v, 'Revision: ') - $start;
          $svnbranch = trim(substr($v, $start, $end));
          
          $svnproject = str_replace('.', '/', substr($p, 0, $trunc));

          array_push($array{'locations'}, 
            array('location' => array(
                                  'remote' => $svnbranch, 
                                  'local' => $svnproject, 
                                  'revision' => $svnrevision
                                )
            )
          );

          $switch_stmts .= "svn switch -r$svnrevision $svnbranch $svnproject;\n";
      }
    }
    $array{'switch'} = $switch_stmts;
    return $array;
  }
  
  function get_api_dataset() {
    return $this->api_dataset;
  }
  
  function get_xml() {
    $wdkxml = new DomDocument('1.0');
    $wdkxml->preserveWhiteSpace = false;
    $load = $wdkxml->loadXML($this->to_xml($this->api_dataset{'wdk'}, 'wdk'));
    return $wdkxml;
  }

  function to_xml($array, $root) {
     $xml_o = new SimpleXMLElement("<?xml version=\"1.0\"?><$root></$root>");
     $this->array_to_xml($array, $xml_o);
     return $xml_o->asXML();
  }

  function array_to_xml($array, &$xml_o) {
    foreach($array as $key => $value) {
      if(is_array($value)) {
        if(!is_numeric($key)){
          $subnode = $xml_o->addChild("$key");
          $this->array_to_xml($value, $subnode);
        }
        else{
          $this->array_to_xml($value, $xml_o);
        }
      }
      else {
        $xml_o->addChild("$key","$value");
      }
    }

  }
  
  function to_json() {
    return json_encode($this->api_dataset);
  }
}
/**
<wdk>
  <modelname>${applicationScope.wdkModel.name}</modelname>
  <modelversion>${applicationScope.wdkModel.version}</modelversion>
  <databases>
    <appdb>
      <servicename>${wdkRecord.attributes['service_name'].value}</servicename>
      <instancename>${wdkRecord.attributes['instance_name'].value}</instancename>
      <globalname>${wdkRecord.attributes['global_name'].value}</globalname>
      <aliases><c:forEach var="a" items="${appdbAliases.nameArray}">
        <alias>${a}</alias></c:forEach>
      </aliases>
    </appdb>
    <userdb>
      <servicename>${cache.dbInfo['service_name']}</servicename>
      <instancename>${cache.dbInfo['instance_name']}</instancename>
      <globalname>${cache.dbInfo['global_name']}</globalname>
      <aliases><c:forEach var="a" items="${userdbAliases.nameArray}">
        <alias>${a}</alias></c:forEach>
      </aliases>
    </userdb>
  </databases>
  <modelconfig>
    <c:forEach 
        var="section" items="${modelConfig.props}"
    ><${fn:toLowerCase(section.key)}><c:forEach 
        var="cfg" items="${section.value}"
    ><${fn:toLowerCase(cfg.key)}>${fn:escapeXml(cfg.value)}</${fn:toLowerCase(cfg.key)}>
    </c:forEach>
        </${fn:toLowerCase(section.key)}>
    </c:forEach>
  </modelconfig>
  <commentconfig>
    <c:forEach 
        var="cfg" items="${commentConfig.props}"
    ><${fn:toLowerCase(cfg.key)}>${fn:escapeXml(cfg.value)}</${fn:toLowerCase(cfg.key)}>
    </c:forEach>
  </commentconfig>
  <modelprop>
    <c:forEach 
        var="prop" items="${applicationScope.wdkModel.properties}"
    ><${fn:toLowerCase(fn:replace(prop.key, '_', ''))}>${fn:escapeXml(prop.value)}</${fn:toLowerCase(fn:replace(prop.key, '_', ''))}>
    </c:forEach>
  </modelprop>
</wdk>

**/
?>

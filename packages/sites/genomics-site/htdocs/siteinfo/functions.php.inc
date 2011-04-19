<?

function upstreamServer() {
  $headers = apache_request_headers();
  if ( isset($headers['Via']) ) {
      $host_port = getModuleSetting('apache2handler','Hostname:Port');
      $uphost = substr($host_port , 0, strrpos($host_port , ':'));
      return "<a href='http://$uphost/'>$uphost</a>";
  }
}

// http://us.php.net/phpinfo
function getModuleSetting($pModuleName,$pSetting) { 
 $vModules = parsePHPModules(); 
 return $vModules[$pModuleName][$pSetting]; 
} 


// http://us.php.net/phpinfo
function parsePHPModules() { 
 ob_start(); 
 phpinfo(INFO_MODULES); 
 $s = ob_get_contents(); 
 ob_end_clean(); 
  
 $s = strip_tags($s,'<h2><th><td>'); 
 $s = preg_replace('/<th[^>]*>([^<]+)<\/th>/',"<info>\\1</info>",$s); 
 $s = preg_replace('/<td[^>]*>([^<]+)<\/td>/',"<info>\\1</info>",$s); 
 $vTmp = preg_split('/(<h2>[^<]+<\/h2>)/',$s,-1,PREG_SPLIT_DELIM_CAPTURE); 
 $vModules = array(); 
 for ($i=1;$i<count($vTmp);$i++) { 
  if (preg_match('/<h2>([^<]+)<\/h2>/',$vTmp[$i],$vMat)) { 
   $vName = trim($vMat[1]); 
   $vTmp2 = explode("\n",$vTmp[$i+1]); 
   foreach ($vTmp2 AS $vOne) { 
    $vPat = '<info>([^<]+)<\/info>'; 
    $vPat3 = "/$vPat\s*$vPat\s*$vPat/"; 
    $vPat2 = "/$vPat\s*$vPat/"; 
    if (preg_match($vPat3,$vOne,$vMat)) { // 3cols 
     $vModules[$vName][trim($vMat[1])] = array(trim($vMat[2]),trim($vMat[3])); 
    } elseif (preg_match($vPat2,$vOne,$vMat)) { // 2cols 
     $vModules[$vName][trim($vMat[1])] = trim($vMat[2]); 
    } 
   } 
  } 
 } 
 return $vModules; 
} 

function getWSKey() {
  $ws_key_file = '/usr/local/tomcat_instances/shared/.apidb_siteinfo_key';
  if ($fh = fopen($ws_key_file, "r")) {
    while (!feof($fh)) {
       $line = trim(fgets($fh));
       if (preg_match("/^[0-9a-zA-Z]/", $line)) {
         return $line;
       }
    }
    fclose($fh);
  }
}

function get_web_page($url, $postdata) {
    $options = array(
        CURLOPT_RETURNTRANSFER => true, 
        CURLOPT_HEADER         => false,
        CURLOPT_FOLLOWLOCATION => false, // do NOT follow redirects. Following can expose secrete ws_key
        CURLOPT_ENCODING       => "",   
        CURLOPT_USERAGENT      => "siteinfo",
        CURLOPT_AUTOREFERER    => true,
        CURLOPT_CONNECTTIMEOUT => 120, 
        CURLOPT_TIMEOUT        => 120, 
        CURLOPT_MAXREDIRS      => 2,   
    );

    if (isset($postdata) && $postdata != '') {
      $options[CURLOPT_POST] = 1;
      $options[CURLOPT_POSTFIELDS] = $postdata;
    }

    $ch      = curl_init( $url );
    curl_setopt_array( $ch, $options );
    $content = curl_exec( $ch );
    $err     = curl_errno( $ch );
    $errmsg  = curl_error( $ch );
    $response  = curl_getinfo( $ch );
    curl_close( $ch );

    $response['errno']   = $err;
    $response['errmsg']  = $errmsg;
    $response['content'] = $content;
    return $response;
}

// body with <body> tags
function get_body($html) {
    $dom= new DOMDocument();
    $dom->loadHTML($html);
    $body = $dom->getElementsByTagName('body')->item(0);
    return $body;
}

// body content without <body> tags
function get_body_content($html) {
    $body = get_body($html);
    foreach ($body->childNodes as $child) { 
        echo $child->ownerDocument->saveXML( $child ); 
    }
}

function get_post_data_as_string($post) {
    if (!$post) return;
    $kv = array();
    foreach ($post as $key => $value) {
      $kv[] = "$key=$value";
    }
    $postdata = join("&", $kv);
    return $postdata;
}

?>
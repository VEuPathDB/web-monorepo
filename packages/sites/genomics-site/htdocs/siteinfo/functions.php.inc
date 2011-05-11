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

// DOMDocument is php5. contents of temp_5
// go here once all servers are on php5
if (class_exists("DOMDocument")) {
  include "temp_5.php";
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

// hattip to http://blog.rafaelsanches.com/2009/08/05/reading-java-style-properties-file-in-php/
function parse_properties($property_file) {
    $property_text = file_get_contents($property_file);
    if (! $property_text) {
        throw new Exception("unable to read $property_file");
    }
    $result = array();
    $lines = split("\n", $property_text);
    $key = "";
    $isWaitingOtherLine = false;
    foreach ($lines as $i => $line) {
        if (empty($line) || (!$isWaitingOtherLine && strpos($line, "#") === 0))
            continue;
        if (!$isWaitingOtherLine) {
            $key = unescape_property(substr($line, 0, strpos($line, '=')));
            $value = unescape_property(substr($line, strpos($line, '=')+1, strlen($line)));
        }
        else {
            $value .= unescape_property($line);
        }

        /* Check if ends with single '\' */
        if (strrpos($value, "\\") === strlen($value)-strlen("\\")) {
            $value = substr($value,0,strlen($value)-1)."\n";
            $isWaitingOtherLine = true;
        }
        else {
            $isWaitingOtherLine = false;
        }

        $result[$key] = $value;
        unset($lines[$i]);
    }

    return $result;
}

function unescape_property($value) {
    $value = str_replace("\\#", "#",  $value);
    $value = str_replace("\\!", "!",  $value);
    $value = str_replace("\\=", "=",  $value);
    $value = str_replace("\\:", ":",  $value);
    $value = str_replace("\\t", "\t", $value);
    $value = str_replace("\\n", "\n", $value);
    $value = str_replace("\\r", "\r", $value);
    return $value;
}

?>

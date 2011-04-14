<?
/** 
Wrapper on logger.jsp. 
1. to make it prettier. 
2. because the JSP requires an auth key to access
**/

include_once "functions.php.inc";

$ws_key = getWSKey();
$loggerpage = "http://mheiges.toxodb.org/a/admin/logger.jsp?key=$ws_key";
$postdata = get_post_data_as_string($_POST);
$response = get_web_page($loggerpage, $postdata);
echo $response['content'];



/** ************************************************************ **/

function get_post_data_as_string($post) {
    if (!$post) return;
    $kv = array();
    foreach ($post as $key => $value) {
      $kv[] = "$key=$value";
    }
    $postdata = join("&", $kv);
    return $postdata;
}

function get_web_page($url, $postdata) {
    $options = array(
        CURLOPT_RETURNTRANSFER => true, 
        CURLOPT_HEADER         => false,
        CURLOPT_FOLLOWLOCATION => true, 
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
?>
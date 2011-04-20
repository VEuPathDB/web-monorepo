<?
/** 
Wrapper on logger.jsp. 
1. to make it prettier. 
2. because the JSP requires an auth key to access
**/

include_once "functions.php.inc";

if (! function_exists('curl_setopt_array')) {
  echo "not available; requires php 5";
  exit;
}

$ws_key = getWSKey();
$loggerpage_base = "http://" . $_SERVER[SERVER_NAME] . "/a/admin/logger.jsp";
$loggerpage = "$loggerpage_base?key=$ws_key";
$postdata = get_post_data_as_string($_POST);
$response = get_web_page($loggerpage, $postdata);

// it's important to only display a good response to avoid
// exposing the secret ws_key (eg. redirection can cause exposure).
if ( $response['http_code'] == '200' ) {
    get_body_content($response['content']);
} else {
    echo "ERROR. The request for $loggerpage_base returned status code " . $response['http_code'];
}


?>

<?php

class UserAgent {

  var $url;
  var $ua;  
  
  /**
    Options
        url
        post_fields
  **/
  function __construct($opts = null) {
      $this->ua = curl_init();
      if (is_array($opts)) {
        $this->set_url($opts['url']);
        $this->set_post_fields($opts['post_fields']);
      }
  }

  /**
    Static initializer so one can chain methods at construction time
      $c = UserAgent::init()->get_content($opts);
  **/
  static public function init($opts = null) {
    return new self($opts);
  }
  
  
  function get_content() {
      $this->set_return_transfer(true);
      return curl_exec($this->ua);
  }
  
  function set_url($url) {
      $this->url = $url;
      curl_setopt($this->ua, CURLOPT_URL, $url);
  
  }
  
  function set_post_fields($post_fields) {
      $this->set_use_post(true);
      curl_setopt($this->ua, CURLOPT_POSTFIELDS, $post_fields);
  }
  
  function set_use_post($bool) {
      curl_setopt($this->ua, CURLOPT_POST, $bool);
  }
    
  function set_return_transfer($bool) {
      curl_setopt($this->ua, CURLOPT_RETURNTRANSFER, $bool);
  }
  
  function close() {
      curl_close($this->ua);
  }
}

?>
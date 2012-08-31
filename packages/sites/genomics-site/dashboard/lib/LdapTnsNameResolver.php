<?php

class LdapTnsNameResolver {

  private $service_name;
  private $dn;
  private $attrs;
  private $ldap_url;
  
  public function __construct($service_name = null) {
      $this->dn = "cn=OracleContext,ou=applications,dc=apidb,dc=org";
      $this->attrs = array("cn");
      $this->ldap_url = "ds3.apidb.org ds2.apidb.org ds1.apidb.org";
  }
  

  /**
   * Returns an array of aliases from LDAP for given service_name
   *
   * @return array
   */
  public function resolve($service_name = null) {
    $aliases = array();

    if ($service_name != null) {
        $this->service_name = $service_name;
    }

    $filter = "(orclNetDescString=*" . $this->service_name . "*)";

    $conn = ldap_connect($this->ldap_url, 389);
    $r = @ldap_bind($conn);
    if ( ! $r ) { 
        error_log( "unable to bind to directory server");
        return $aliases; 
    }

    $sr=ldap_search($conn, $this->dn, $filter, $this->attrs);

    $entries = ldap_get_entries($conn, $sr);

    ldap_close($conn);

    for ($i = 0; $i < $entries["count"]; $i++) {
      array_push($aliases, $entries[$i]["cn"][0]);
    }

    return $aliases;
  }
}
?>
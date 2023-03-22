package GUS::ObjRelP::DbiRow;
############################################################
#
# Package:  DbiRow
#
#
# Modified  By               Description
# _________________________________________________________
#
# 6/22/00   Sharon Diskn    Created
#
# 3/22/04   Jason Hackney   added PostgreSQL's "now" to list 
# of datetime functions in function quote_and_insert.
#
############################################################

use strict;

use GUS::ObjRelP::DbiDbHandle;
use GUS::ObjRelP::DbiTable;
use Carp;

############################################################
#                      Constructor
############################################################

sub new {                       # constructor using DbiDatabase
  my ($class,$tableClassName,$attributeHash,$databaseObj, $primaryKeyList) = @_;
  if (!$databaseObj) {
    $databaseObj = GUS::ObjRelP::DbiDatabase->getDefaultDatabase();
  }
  &confess ("did not make default database") unless $databaseObj;
  my $table = $databaseObj->getTable($tableClassName);
  my $self = {};
  bless $self, $class;
  $self->setTable($table);
  $self->{'class'} = $class; 
  $self->{'table_name'} = $table->getTableName();
  if ($primaryKeyList) {
    $self->{'primaryKeyList'} = $primaryKeyList;
  }
  if (defined $attributeHash) {
    $self->setAttributes($attributeHash);
  }
  return  $self;
}

############################################################
#                  Get and Set Methods
############################################################

#-----------------------------------------------------------
# TableName
#-----------------------------------------------------------

sub getTableName { my ($self) = @_; return $self->{'table_name'}; }
sub setTableName { my ($self, $table_name) = @_;  $self->{'table_name'} = $table_name; }

##method to get className
sub getClassName{
  my $self = shift;
  return $self->getTable()->getClassName();
}

#-----------------------------------------------------------
# Table - $table is a DbiTable object.
#-----------------------------------------------------------

sub setTable { my ($self,$table) = @_; if ($table) {$self->{'table'} = $table;} }
sub getTable { 
  my ($self) = @_;
  if (!$self->{'table'}) {
    $self->{'table'} = $self->getDatabase()->getTable($self->getClassName());
  }
  return $self->{'table'};
}

############################################################
#                  Row Attribute  Methods
############################################################

#-----------------------------------------------------------
# set - set a single attribute in this row.
#-----------------------------------------------------------

sub set {
  my ($self,$att,$value) = @_;
  $self->checkAttribute($att);

  if (! defined $value) {
    return;
  }
  $self->{'attributes'}->{$att} = $value;
  push (@{$self->{'attributes_set'}},$att);
}

#-----------------------------------------------------------
# get - get a single attribute in this row.
#-----------------------------------------------------------

sub get {
  my ($self,$att) = @_; 
  $self->checkAttribute($att);
  if (! exists $self->{'attributes'}->{$att}) { 
    if ($self->{'didNotRetrieve'}->{$att}) {
      my $err = "ERROR: ".$self->getTableName().".".$self->getId().": Did not retrieve value from DB for $att!\n";
      if ($self->getDatabase()->getExitIfAttNotRetrieved()) {
        &confess($err);
      } elsif ($self->getDatabase()->getPrintErrIfAttNotRetrieved()) {
        print STDERR $err;
      }
    }
    return undef; 
  } 
  return $self->{'attributes'}->{$att};
}

#-----------------------------------------------------------
# getSubstrFromClob
# method to retrieve a substring from a Clob datatype...
# note that substring is 1 indexed....first charcter thus has start of 1
#-----------------------------------------------------------
sub getSubstrFromClob {
  my($self,$att,$start,$length) = @_;
  my $string = "";
  my $stmt = $self->getTable()->getCachedStatement('clobSubstr',$att);
  if (!$stmt) {
    my $pkatts = $self->getTable()->getPrimaryKeyAttributes();
    my $query = "select DBMS_LOB.SUBSTR($att,?,?) from ".$self->getTable()->getOracleTableName()." where $pkatts->[0] = ?"; ##".$self->getId();
    #    print STDERR "getSubstrFromClob: $query\n";
    $stmt = $self->getDbHandle()->prepare($query);
    $self->getTable()->cacheStatement('clobSubstr',$att,$stmt);
  }
  ##need loop if $length > 4000 as can only get 4000 at a time....
  for (my $s = $start; $s < $start + $length;$s += 4000) {
    $stmt->execute($s + 4000 <= $start + $length ? 4000 : $length + $start - $s,$s,$self->getId());
    while (my($str) = $stmt->fetchrow_array()) {
      #      print STDERR "$str\n";
      $string .= $str;
    }
  }
  return $string;
}

#-----------------------------------------------------------
# markAttributeSet - this will be going away...still used in 
# RelationalRow.pm
#-----------------------------------------------------------
sub markAttributeSet {
  my($self,$att) = @_;
  push (@{$self->{'attributes_set'}},$att);
}

#-----------------------------------------------------------
# setAttributes - replace the current attributes hash with
#                 $attributeHash.
#-----------------------------------------------------------

sub setAttributes { 
  my ($self,$attributeHash) = @_; 
  my %attCopy;                  # = %$attributeHash; ## copy hash to protect from outside
  foreach my $att (keys%{$attributeHash}) {
    next if $attributeHash->{$att}	=~ /^\s*null\s*$/i;
    $attCopy{$att} = $attributeHash->{$att};
  }
  $self->checkAttributeHash(\%attCopy);
  $self->{'attributes'} = \%attCopy; 
}

#-----------------------------------------------------------
# getAttributes - returns a copy of the attributes hash for
#                 this row.
#-----------------------------------------------------------

sub getAttributes { 
  my ($self) = @_; 
  if ($self->{'attributes'}) {
    my %s = %{$self->{'attributes'}}; 
    return \%s;                 ## copy
  }
  return undef;
}

#-----------------------------------------------------------
# getChangedAttributes - returns a copy of the changed 
#                        attributes hash for this row.
#-----------------------------------------------------------

sub getChangedAttributes {
  my ($self) = @_;   my %atts;
  foreach my $att (@{$self->{'attributes_set'}}) {
    $atts{$att} = $self->get($att);
  }
  return \%atts;
}



sub retrieveFromDB {
  my ($self,$doNotRetAtts) = @_;
  my $dbh = $self->getDbHandle();
  ##want to cache statements....
  ##create dbi statement with  bind  values..
  my @valuesArr;
  my $cacheKey; 
  my $atthash = $self->getAttributes();

  ##if $doNotRetAtts need to build up stmt...
  my @atts;
  if ($doNotRetAtts) {
    my $attlist = $self->getTable()->getAttributeList();
    foreach my $a (@$attlist) {
      push(@atts,$a) unless grep /^$a$/,@$doNotRetAtts;
    }
    ##if not retrieving atts that needs to be reflected in the cache key..
    foreach my $att (@$doNotRetAtts) {
      $cacheKey .= "NOT".$att;
      $self->{'didNotRetrieve'}->{$att} = 1;
    }
  }

  my $sql = "select ".($doNotRetAtts ? join(', ',@atts) : "*"). " from " . $self->getTable()->getOracleTableName() . " where ";

  my @where;
  while ( my($key, $value) = each(%$atthash) ) {
    if ($value =~ /^null$/i || $value =~ /^\s*$/ || !defined($value)) {
      push(@where, " $key is NULL");
      #      push(@valuesArr,undef);
      $cacheKey .= "is$key";
    } else {
      push(@where, " $key = ?");
      push(@valuesArr,$value);
      $cacheKey .= "$key";
    }
  }
  $sql .= join(' and ',@where);

  if ($self->getDatabase()->getVerbose()) {
    print STDERR "\nRetrieveFromDB: $sql\n  bindValues (",join(', ',@valuesArr),")\n";
  }

  #have the DbiTable cache statement handles
  my $sth;
  $sth = $self->getTable()->getCachedStatement('retrieve',$cacheKey);
  if (!$sth) {
#        print STDERR "retrieveFromDB: $sql\n";
    $sth = $self->getDbHandle()->prepare($sql);
    $self->getTable()->cacheStatement('retrieve',$cacheKey,$sth);
  }

  $sth->execute(@valuesArr)
    || die("Failed executing:\n $sql \n\n with values '"
	   . join("'  '", @valuesArr) 
	   . "'\n errormsg: " . $sth->errstr ."\n");

  my $exists = 0;
  my $attributeHash;
  while (my $row = $sth->fetchrow_hashref('NAME_lc')) {
    $exists++;
    $attributeHash = $row if $exists == 1;
    #		$sth->finish() if $exists > 1;
  }
  #	print STDERR "\nretrieveFromDB: $exists\n";
  if ($exists == 1) {
    $self->setAttributes($attributeHash);
    $self->synch();
  } elsif ($exists > 1) {
    print STDERR "\nERROR ".$self->getTableName().": retrieveFromDB: $sql\t$exists rows returned!\n";
  }
  return $exists == 1 ? $exists : 0;
}

#-----------------------------------------------------------
# add - set each of the attributes in $attributeHash.
#-----------------------------------------------------------

sub add {                       ## set/add-in a whole hash at a time
  my ($self,$attributeHash)= @_; 
  foreach my $att (keys %$attributeHash) { 
    $self->set($att,$attributeHash->{$att}); 
  }
}

#-----------------------------------------------------------
# hasChangedAttributes - returns 0 if no attributes have
#         been set, 1 if attributes have been set.
#-----------------------------------------------------------

sub hasChangedAttributes {
  my ($self) = @_; 
  if (!$self->{'attributes_set'}) {
    return 0;
  }
  return scalar(@{$self->{'attributes_set'}});
}

############################################################
#                  ID/Primary Key  Methods
############################################################

#-----------------------------------------------------------
# getId - returns id (value of primary key) if not a
#         composite; otherwise prints and error message.
#-----------------------------------------------------------
sub getId {                     ## Returns id if not a composite key
  my ($self) = @_; 
  my $idHash = $self->getPrimaryKey();
  if (!$idHash) { 
    &confess("GUS::ObjRelP::DbiRow->getId failed:  Unknown primary key for ".$self->getTableName()." \n");
  }
  my @key_list = values(%{$idHash});
  if (scalar @key_list > 1) { 
    print $self->getTableName()." GUS::ObjRelP::DbiRow->getId: keys @key_list getId only works with a single key\n";
    return;
  }
  return $key_list[0];
}

#-----------------------------------------------------------
# hasSinglePrimaryKey - returns 1 if has a single key primary key
#-----------------------------------------------------------
sub hasSinglePrimaryKey {       ## Returns id if not a composite key
  my ($self) = @_; 
  my $idHash = $self->getPrimaryKey();
  if (!$idHash) { 
    &confess("GUS::ObjRelP::DbiRow->hasSinglePrimaryKey failed:  Unknown primary key for ".$self->getTableName()." \n");
  }
  return scalar(keys%{$idHash}) == 1 ? 1 : 0;
}

#-----------------------------------------------------------
# setId - set the attribute representing the primary key for
#         this row - NOTE: ASSUMES NOT A COMPOSITE KEY.
#-----------------------------------------------------------
sub setId {
  my ($self,$id) = @_; 
  my @keylist = @{$self->getTable()->getPrimaryKeyAttributes()};
  $self->set($keylist[0],$id);
}

#-----------------------------------------------------------
# getPrimaryKey - returns a hashRef of attribute 
#         name/values of primary key.
#-----------------------------------------------------------

sub getPrimaryKey {
  my ($self) = @_;   my $keys;
  my $pkAtts = $self->getTable()->getPrimaryKeyAttributes();
  if (!$pkAtts) { 
    &confess("Unknown primary key attributes for ".$self->getTableName()
      ."\n\tGUS::ObjRelP::DbiRow->getPrimaryKey failed\n");
  }
  foreach my $key (@$pkAtts) {
    $keys->{$key} = $self->get($key);
  }
  return $keys;
}


#-----------------------------------------------------------
# setIdentityInsertOn - sets identity insert to 1.
#-----------------------------------------------------------

sub setIdentityInsertOn {
  my($self) = @_;
  $self->{'identityInsert'} = 1;
}

#-----------------------------------------------------------
# setIdentityInsertOff - sets identity insert to 0.
#-----------------------------------------------------------

sub setIdentityInsertOff {
  my($self) = @_;
  $self->{'identityInsert'} = 0;
}

#-----------------------------------------------------------
# isIdentityInsertOn - returns 1 if identity insert is on
#           returns 0 if identity insert is off.
#-----------------------------------------------------------
sub isIdentityInsertOn { 
  my $self = shift;
  return $self->{'identityInsert'};
}

############################################################
#                 View Related Methods
############################################################

#-----------------------------------------------------------
# setViewsUnderlyingTable - sets the underlying table
#        for the view to which this row is an instance of.
#-----------------------------------------------------------

##now gets from table..
#sub setViewsUnderlyingTable {
#  my($self,$table) = @_;
#  $self->getTable()->setViewsUnderlyingTable($table);
#}
sub getViewsUnderlyingTable {
  my $self = shift;
  return $self->getTable()->isView() ? $self->getTable()->getRealPerlTableName() : undef;
}

############################################################
#                 Utility  Methods
############################################################

#-----------------------------------------------------------
# synch - clears all attributes set for this row. ie. marks
#         the row unchanged - used to determine if submit
#         needed.
#-----------------------------------------------------------
sub synch {
  my ($self) = @_; 
  while (pop @{$self->{'attributes_set'}} ) {
  } 
}

#-----------------------------------------------------------
# toString - returns a string representing this row. String
#         includes the Table/View name (class in GUS), and 
#         a listing of all the attributes.
#-----------------------------------------------------------
sub toString {
  my ($self) = @_;
  my $s =  "Table: ".$self->{'table_name'}."\n"; ## add more to this
  foreach my $att (keys %{$self->getAttributes()}) {
    $s .= "\t$att: [".$self->get($att)."]\n";
  }
  return $s;
}

############################################################
#                 Relationship  Methods
############################################################

#-----------------------------------------------------------
# getRelations - returns a list ref 
#-----------------------------------------------------------

#dtb: called by retrieveParentsFromDb, retrieveChildrenFromDb in GusRow.pm
#both of which pass in $relationKey as the $foreign_table
#and pass in $relationKey as $object_type

sub getRelations {              # returns list ref # this assume only one rel between tables!
    my ($self,$foreign_table,$self_column,$foreign_column,$object_type,$where,$doNotRetAtts) = @_;
    #  print STDERR "DbiRow:getRelations($self,$foreign_table,$self_column,$foreign_column,$object_type,$where)\n";
    my ($foreignKey);
    my $dbh = $self->getDbHandle();
    if (!$self_column) {
	&confess("self_column is null");
    }
    
    if (!$foreign_column) {
	&confess("foreign_column is null");
    }
    
    ##note want to cache the statements to  make more efficient...do not cache if $where
    my $cacheKey = "";
    
    ##if $doNotRetAtts need to build up stmt...
    my @atts;
    my $dnr = {};
    if ($doNotRetAtts && ref $doNotRetAtts eq 'ARRAY') {
	my $attlist = $self->getDatabase()->getTable($foreign_table)->getAttributeList();
	foreach my $a (@$attlist) {
	    push(@atts,$a) unless grep /^$a$/,@$doNotRetAtts;
	}
	##if not retrieving atts that needs to be reflected in the cache key..
	foreach my $att (@$doNotRetAtts) {
	    $cacheKey .= "NOT".$att;
	    $dnr->{$att} = 1;
	}
    }
    
    my @valuesArr;
    my @where;
    while (my($key, $value) = each(%$where) ) {
	push(@where, " $key = ?");
	push(@valuesArr,($value =~ /^null$/i ? undef : $value));
	$cacheKey .= "$key";
    }
    push(@where, " $foreign_column = ?");
    push(@valuesArr,$self->get($self_column));
    $cacheKey .= "$foreign_column";
    my $whereClause = join(' and ',@where);
    
    my $sth = $self->getTable()->getCachedStatement($foreign_table,$cacheKey.$self_column);
    
    my $forTbl = $self->getDatabase()->getTable($foreign_table);
    
    my $sql = "select ".($doNotRetAtts ? join(', ',@atts) : "*"). " from " . $forTbl->getOracleTableName() . " where " . $whereClause;
    
    if ($self->getDatabase()->getVerbose()) {
	print STDERR "\ngetRelations: $sql\n  bindValues (",join(', ',@valuesArr),")\n";
    }
    
    if (!$sth) {                  ##don't have it cached...
	$sth = $dbh->prepare($sql);
	##now the caching...
	#    print STDERR "Caching $sql\n";
	$self->getTable()->cacheStatement($foreign_table,$cacheKey.$self_column,$sth);
    }
    
    $sth->execute(@valuesArr);
    my (@objects);
    my $i = 0;
    while (my $row = $sth->fetchrow_hashref('NAME_lc')) {
	if (!$object_type) {
	    $objects[$i] = GUS::ObjRelP::DbiRow->new($foreign_table,$row,$self->getDatabase(),undef); 
	} else {
	    ##      $objects[$i] = $object_type->new($row,undef,$dbh); 
	    $objects[$i] = $object_type->new($row,$self->getDatabase()); 
	}
	if ($doNotRetAtts) {
	    $objects[$i]->{'didNotRetrieve'} = $dnr;
	}
	$i++;
    }
    return \@objects;
    
}

sub getNextID {
  my ($self,$holdlock) = @_;

  if (!$self->getTable()->hasSingleKey()) {
    print STDERR "ERROR: ",$self->getTableName(),"->getNextID...not a single att primary key!\n";
    return undef;
  }
  my $idName = $self->getTable()->getPrimaryKeyAttributes()->[0];
  my $table = $self->getTable()->isView() ? $self->getDatabase()->getTable($self->getViewsUnderlyingTable()) : $self->getTable();
  $self->{'attributes'}->{$idName} = $table->getNextID($holdlock);
  return $self->{'attributes'}->{$idName};
}

sub create_id {
  my ($self,$holdlock) = @_;
  # assumes single key
  return $self->getNextID($holdlock);
}
sub getLastIdInsert {
  my ($self) = @_;
  ## CHECK FOR ORACLE
  my ($id) = $self->getDbHandle()->selectrow_array('select id=@@identity');
  return $id;
}

sub getDbHandle {
  my ($self) = @_;  
  my $dbh = $self->getTable()->getDatabase()->getDbHandle;
  if (!$dbh) {
    print "No db handle for DbiRow ".$self->toString();
  }                             # die?
  return $dbh;
}

sub getMetaHandle {
  my ($self) = @_;  
  my $dbh = $self->getTable()->getDatabase()->getMetaDbHandle();
  if (!$dbh) {
    print "No db handle for DbiRow ".$self->toString();
  }                             # die?
  return $dbh;
}

sub getDatabase {
  my ($self) = @_;
  if ($self->{'table'}) {
    return $self->{'table'}->getDatabase();
  }
  return GUS::ObjRelP::DbiDatabase->getDefaultDatabase();
}
sub removeFromDB {              ##Shouldn't this synch??? Where is deleted refereced?
  my ($self) = @_;
  my $whereHash = $self->getPrimaryKey();
  unless ($whereHash) {
    $whereHash = $self->getAttributes();
  }
  my $whereClause = $self->getTable()->makeWhereHavingClause($whereHash);
  my $numRows = $self->getDbHandle()->sqlexecIns("DELETE FROM ".$self->getTable()->getOracleTableName()." $whereClause");
  $self->{'deleted'} = 1;
  return $numRows;
}

sub isDeleted { my ($self) = @_; return $self->{'deleted'}; }

sub update {
  my ($self) = @_;
  if (! $self->hasChangedAttributes() ) {
    return;
  }                             # if none updated return
  if (! $self->getPrimaryKey()) { 
    &confess("No primary key defined for update ".$self->toString()."\n");
  }
  my $dbh = $self->getDbHandle();
  my $numRows = $self->quote_and_update($self->getChangedAttributes(),
                                        $self->getPrimaryKey()); 
  $self->synch();
  return $numRows;
}
sub insert {
  my ($self) = @_;
  if ($self->getTable()->hasSingleKey() && !$self->getId() 
			&& !$self->getTable()->pkIsIdentity()) {
    $self->getNextID();
  }
  my $dbh = $self->getDbHandle();
  my $numRows = 0;

  $numRows = $self->quote_and_insert($self->getAttributes());

  $self->synch();
  return $numRows;
}

#------------------------------------------------------
# PRIVATE Methods...
#------------------------------------------------------
sub quote_and_insert {
  ## INSERT HASH REF PASSED IN
  my ($self, $insert ) = @_;
  my ($insert_clause, $values_clause, $key, $value); ## locals

  ##deal with clob types....actually any long strings...>500 chars...
  my $valuesArr;
  my $cacheKey;

  ##binding all values except date....dbi will do quoting..
  while ( ($key, $value) = each(%$insert) ) {
    #    if ( !defined $value ) {
    #      &confess("\n No value($value) for attribute $key for table insertion. \n");
    #    }
    $insert_clause .= " $key,";
    if ($value =~ /^\s*(sysdate|getdate|now).{0,2}\s*$/i) {
      $values_clause .= " $value,"; 
      $cacheKey .= $key;
    } elsif ($value eq '') {    ##oracle treats this like NULL but others may not..
      $values_clause .= " null,";
      $cacheKey .= $key;
    } else {
      $values_clause .= ' ?,';
      push(@$valuesArr,($value =~ /^null$/i ? undef : $value));
      $cacheKey .= "b$key";
    }
  }

  ## chop off commas at end
  chop($insert_clause);  chop($values_clause);

  my $sql_cmd = "
    INSERT INTO ".$self->getTable()->getOracleTableName()." ( $insert_clause )
    VALUES   ( $values_clause ) ";

  #have the DbiTable cache statement handles
  my $stmt;
  $stmt = $self->getTable()->getCachedStatement('insert',$cacheKey);
  if (!$stmt) {
    #    print STDERR "Creating new statement $sql_cmd\n";
    $stmt = $self->getDbHandle()->prepare($sql_cmd);
    $self->getTable()->cacheStatement('insert',$cacheKey,$stmt);
  }

  return $self->getDbHandle()->sqlExec($stmt,$valuesArr,$sql_cmd);

  #  return $self->getDbHandle()->sqlexecIns($sql_cmd,$valuesArr);
}

sub quote_and_update {
  ## PARAMETERS - dbhandle, table(string), set hash ref, where hash ref, 
  my ($self, $set, $where, $override_update_operator) = @_;
  my $dbh = $self->getDbHandle();
  my $valuesArr;
  my $set_clause = "";
  my $cacheKey = "";
  
  ## binding all values except date
  while ( my ($key, $value) = each(%$set) ) {
    #    if (!defined $value || ( $dbh->getNoEmptyStrings() && $value =~ /^\s*$|^"\s*"$/ ) ) { ## NULL CHECK
    #      &confess("\n$key is empty string($value) for set clause of $table update. \n");
    #    }
    if ($value =~ /^\s*(sysdate|getdate).{0,2}\s*$/i) {
      $set_clause .= "\n\t$key = $value,";
      $cacheKey .= $key;
    } elsif ($value eq '') {
      $set_clause .= "\n\t$key = '',";
      $cacheKey .= $key; 
    } else {
      $set_clause .= "\n\t$key = ?,";
      push(@$valuesArr,($value =~ /^null$/i ? undef : $value));
      $cacheKey .= "b$key";
    }
  }
  
  my @where_clause;
  while ( my ($k,$v) = each(%$where) ) {
    $cacheKey .= "b$k";
    push(@where_clause,"$k = ?");
    push(@$valuesArr,$v);
  }
  chop($set_clause);            ## get rid of last comma

  my $sql_cmd = "
    UPDATE  ".$self->getTable()->getOracleTableName()."
    SET     $set_clause
    WHERE   ".join(' and ',@where_clause);
  #have the DbiTable cache statement handles
  my $stmt;
  $stmt = $self->getTable()->getCachedStatement('update',$cacheKey);
  if (!$stmt) {
    #    print STDERR "Creating new statement $sql_cmd\n";
    $stmt = $self->getDbHandle()->prepare($sql_cmd);
    $self->getTable()->cacheStatement('update',$cacheKey,$stmt);
  }

  return $self->getDbHandle()->sqlExec($stmt,$valuesArr,$sql_cmd);

}

#check to make sure this is a valid attribute/col in the 
#table/view.  PRIVATE?
sub checkAttribute {
  my ($self,$att) = @_;
  if ($self->getTable()->isValidAttribute($att)) {
    return  1;
  } else {
    &confess("ERROR: attempting to access attribute '$att' of table $self->{'table_name'}, but that table does not have such an attribute\n\n");
  }
}
# SJD PRIVATE check the attributes as a hash.
sub checkAttributeHash {
  my ($self,$newAttributeHash) = @_;
  foreach my $att (keys %$newAttributeHash) {
    $self->checkAttribute($att);
  }
}

sub className2oracleName {
  my ($className) = @_;
  return GUS::ObjRelP::DbiTable::className2oracleName($className);
}

1;

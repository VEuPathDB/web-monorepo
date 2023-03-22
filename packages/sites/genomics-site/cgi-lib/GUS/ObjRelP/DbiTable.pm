package GUS::ObjRelP::DbiTable;

############################################################
#
# Package:  DbiTable
#
# Modified  By               Description
# _________________________________________________________
#
# 6/22/00   Sharon Diskin    Created
#
# 4/9/02    Brian Brunk      Modified to allow instantiation of table objects by Generator
#
# 3/22/04   Jason Hackney    Moved Oracle specific SQL into
# Oracle.pm, and added support for PostgreSQL.  Metadata queries
# are now handled generically by instantiating an Oracle or
# PostgreSQL object in DbiDatabase.pm.
############################################################

use strict;
use GUS::ObjRelP::DbiDatabase;
use GUS::ObjRelP::DbiRow;
use Carp;

############################################################
# Constructor - note tableSth is used to hold all the 
# table information.  This is prepared and executed when
# the object is created, and then is available for use
# later to obtain meta data about table.
############################################################

# $dbiDbObj is a DbiDatabase object - it has the dbhandles
sub new {
  my ($class,$className,$dbiDbObj) = @_;
  my $self = {};
  bless $self, $class;
  $self->{'database'} = $dbiDbObj;
  $className = $class unless $className;
  $className = $self->getFullClassName($className);
  $self->{'perl_table_name'} = $className;
  $className =~ /GUS::Model::(\w+)::(\w+)/;
  ($self->{schema}, $self->{table_name}) = ($1,$2);
  $self->{'oracle_table_name'} = "$self->{schema}.$self->{table_name}";
  $self->setDefaultParams() unless $class eq 'GUS::ObjRelP::DbiTable';
  return $self;
}

sub setDefaultParams {
  my $self = shift;
  print STDERR "DbiTable superclass method...there are NO default params to set\n";
}

############################################################
# InstanceClass Methods:
#
# setInstanceClass - sets the instance class to $className
# getInstanceClass - returns string representing instance
#                    class name
#
############################################################


sub setInstanceClass {
  my ($self,$classname) = @_;
  $classname = $self->getFullClassName($classname);
  $self->{'instanceClass'} = $classname;
}
sub getInstanceClass {
  my ($self) = @_;
  if (!$self->{'instanceClass'}) {
    $self->{'instanceClass'} = $self->getClassName();
  }
  return $self->{'instanceClass'};
}

############################################################
# Database Methods:  The DbiTable object needs to know about
#                    what database it belongs to...
#
# getDatabase - returns the DbiDatabase object that this 
#               table uses.
# getDbHandle-  returns the database handle for the related
#               DbiDatabase object.
# getDbName   - returns a string representing the database
#               name.  NOT IMPLEMENTED FOR ORACLE.
############################################################

sub getDatabase { 
  my ($self) = @_;
  if (!$self->{'database'}) {
    $self->{'database'} = GUS::ObjRelP::DbiDatabase->getDefaultDatabase();
  }
  return $self->{'database'};
}

sub getDbHandle { my ($self) = @_; return $self->getDatabase()->getDbHandle(); }
sub getMetaDbh {	my ($self) = @_; return $self->getDatabase()->getMetaDbHandle(); }

sub getDbName() {
  my ($self) = @_;
  if (!$self->{'dbName'}) { 
    $self->{'dbName'} = $self->getDatabase()->getDbName();
  }
  return $self->{'dbName'};
}

############################################################
# Table Related Methods:  These are methods directly that
#                         directly relate to a specific
#                         table object.  For example: 
#                         getting table name, getting a list
#                         of all the attributes (col names),
#                         determining which tables/views
#                         are parents/children...
#
# getTableName - returns the name of this table or view.
# getAttributelist - returns a list of attribute names.
# NEED TO BE IMPLEMENTED FOR ORACLE STILL:
# getAttributeInfo - returns type information for each of
#                    the attributes of the table/view. NOTE
#                    this needs to be implemented for Oracle
# getParentRelations - returns a hash of the parent 
#                    relations.  The parent object holds 
#                    the primary key and the child holds
#                    the foreign key pointing to the parent.
# getChildRelations - returns a hash of the child relations
#                    The parent object holds the primary key
#                    and the child holds the foreign key 
#                    pointing to the parent.
#
# 
############################################################

sub getOracleTableName { my ($self) = @_; return $self->{'oracle_table_name'}; }
sub getClassName { my ($self) = @_; return $self->{'perl_table_name'}; }
sub getTableName { my ($self) = @_; return $self->{'table_name'}; }
sub getSchemaName { my($self) = @_; return $self->{schema}; }
sub setSchemaName { my($self,$val) = @_; $self->{schema} = $val; }

sub getSchemaNameUpper {
  my($self) = @_;
  if(!$self->{schemaOwner}){
    $self->{schemaOwner} = $self->getSchemaName();
    $self->{schemaOwner} =~ tr/a-z/A-Z/;
  }
  return $self->{schemaOwner};
}

sub getAttributeList {
  my ($self) = @_;
  if ( ! exists ( $self->{'attributeNames'} ) ) {
    $self->cacheAttributeInfo();
  }
  return $self->{'attributeNames'};
}

sub isValidAttribute {
  my($self,$att) = @_;
  if (!exists $self->{'valid_attributes'}) {
    my $atts = $self->getAttributeList();
    foreach my $a (@{$atts}) { 
      #				$a =~ tr/A-Z/a-z/;
      $self->{'valid_attributes'}->{$a} = 1; 
    }
  }	
  $att =~ tr/A-Z/a-z/;
  return $self->{'valid_attributes'}->{$att};
}

##setting att information in table objects..
sub setAttributeNames {
  my($self,@names) = @_;
  @{$self->{attributeNames}} = @names;
}

sub setQuotedAtts {
  my($self,@names) = @_;
  foreach my $n (@names){
    $self->{quotedAtts}->{$n} = 1;
  }
}

sub setAttInfo {
  my($self,@attHashes) = @_;
  @{$self->{attInfo}} = @attHashes;
}

##method that uses dbi to get and store the attribute information...
sub cacheAttributeInfo {
  my($self) = @_;
  my $table_name = $self->getTableName();
  my $schema_name= $self->getSchemaName();
	my $owner=$self->getSchemaNameUpper();
	my $sql=$self->getDatabase->getDbPlatform->attributeSql($owner,$table_name);
	my $stmt=$self->getMetaDbh->prepareAndExecute($sql);
  while (my($name,$type,$nulls,$col_id,$precision,$length,$scale) = $stmt->fetchrow_array()) {
    $name =~ tr/A-Z/a-z/;
    push (@{$self->{'attributeNames'}}, $name);
    push(@{$self->{'attInfo'}},{ 'col' => $name,
                                 'type' => $type,
                                 'prec' => $precision,
                                 'length' => $length,
                                 'scale' => $scale,
                                 'Nulls' => $nulls eq 'N' ? 0 : 1,
                                 'base_type' => 'not set',
                               });
    $self->{'quotedAtts'}->{$name} = 1 if $type !~ /(NUMBER|FLOAT|numeric|int)/i;
	}
}

sub getAttributeInfo {
  my  ($self) = @_;
  if ($self->{'attInfo'}) {
    return $self->{'attInfo'};
  }
	else {
    $self->cacheAttributeInfo(); ##generic dbi method
	}
  return $self->{'attInfo'};
}

##methods for building objects given a row from an Imp table...

sub buildObjectsFromImpTable {
  my($self,$row) = @_;
  #  print STDERR "Building objects from Imp table...\n";
  if ($self->getTableName !~ /Imp$/ ) {
    print STDERR "ERROR: method buildObjectsFromImpTable can only be invoked on an Imp table\n";
    return undef;
  }
  my $superClass = $self->getTableName();
  $superClass =~ s/Imp$//;
  my $table = ($row->{'subclass_view'} && $row->{'subclass_view'} !~ /null/i) ? $row->{'subclass_view'} : $superClass;
  my $className = $self->getFullClassName($self->getSchemaName(). "::$table");
  eval("require $className");
  #	print STDERR "Building object for $superClass: $class\n";
  my %map = $self->getDatabase->getTable($className)->getViewMapping();
  my $ob = $className->new(undef,$self->getDatabase());
  #	print STDERR "setting values for $ob\n";
  foreach my $col (keys %map) {
    #		print STDERR "$col --> $map{$col}\n";
    #		print STDERR "'$col' -> '$row->{$col}'\n";
    $ob->set($map{$col},$row->{$col});
  }
  #	print STDERR "buildObjectsFromImpTable:\n".$ob->toString();
  return $ob;
}

sub getViewMapping {
  my($self) = @_;
  if (!exists $self->{viewMapping}) {
    #		print STDERR "getting view mapping for ".$self->getTableName()."\n";
    ##retrieve from db...
    my $sql = $self->getViewSql();
    #    print STDERR "$sql\n";
    $sql =~ s/\s+/ /g;
    $sql =~ s/(\/\*.*?\*\/)//g;
    #		print STDERR "$sql\n";
    $sql =~ s/^.*?select\s+(.*?)\s+from\s+\S+Imp.*$/$1/i;
    #		print STDERR "  SQL: '$sql'\n";
    if ($self->getDatabase->getDSN() =~ /oracle/i) {
      foreach my $att (split(', *',$sql)) {
        #			print STDERR "$att\n";
        my($i,$v) = split(' as ',$att);
        $i =~ s/^.*?\.(\w+)$/$1/;
        $v = $v ? $v : $i;
        #			print STDERR "'$i' => '$v'\n";
        $self->{'viewMapping'}->{$i} = $v;
      }
    } else {
      print STDERR "getViewMapping not implemented for '".$self->getDatabase->getDSN()."'\n";
    }
  }
  return %{$self->{viewMapping}};
}

sub getViewSql {
  my ($self) = @_;
  my $sql;
  my $table = $self->getTableName();
  my $owner = $self->getSchemaNameUpper();
	my $query = $self->getDatabase->getDbPlatform->viewSql($owner,$table);
#    print STDERR "getViewSql: $query\n";
    
  my($tmpSql) =  $self->getDbHandle()->selectrow_array($query);
  ##now need to put in the att names properly...
  $tmpSql =~ s/\s+/ /g;
  my($raw_atts,$from) = ($tmpSql =~ /^.*?select\s+(.*?)\s+(from\s+\S+Imp.*)$/i);
  $raw_atts =~ s/(\/\*.*?\*\/)//g; ##removes comments
  #    print STDERR "getViewSql - Select stmt:\nSELECT $raw_atts $from\n";
  my $atts = $self->getAttributeList();
  my @viewatts = split(', *',$raw_atts);
  $sql = "SELECT ";
  for (my $i = 0;$i<scalar(@viewatts);$i++) {
    my $attName  = $viewatts[$i];
    $attName =~ s/(^\S+).*/$1/;
    $self->{'viewMapping'}->{$attName} = $atts->[$i];
    $sql .= $atts->[$i] eq $attName ? "$atts->[$i],\n" : "$attName as $atts->[$i],\n";
	}
  $sql .= "$from\n";
  #	print STDERR "view sql:\n$sql\n";
  return $sql;
}

sub setIsView { my($self,$val) = @_; $self->{isView} = $val; }

sub isView {
  my($self) = @_;
  if (!defined $self->{isView}) {
    ### SQL CHANGE ###
    my $coredb = $self->getDatabase()->getCoreName();
    my $schemaName = $self->getSchemaName();
    my $sql = "select is_view from ${coredb}.TableInfo ti, ${coredb}.DatabaseInfo di where ti.name = '" . $self->getTableName() . "'" . " and di.name = '$schemaName' and ti.database_id = di.database_id";

    #    print STDERR "isView: $sql\n";
    my $stmt = $self->getDatabase()->getQueryHandle()->prepareAndExecute($sql);
    while (my($iv) = $stmt->fetchrow_array()) {
      $self->{isView} = $iv;
    }
  }
  return $self->{isView};
}

##this method returns the Imp table name if this is a view else returns self tablename
sub getRealTableName {
  my($self) = @_;
  if (!exists $self->{realTableName}) {
    if ($self->isView() ) {
      my $sql = "select t2.name as superclass,t1.name as subclass from ".$self->getDatabase()->getCoreName(). ".TableInfo t1,".$self->getDatabase()->getCoreName(). ".TableInfo t2 where t2.table_id = t1.view_on_table_id and t1.name = '".$self->getTableName()."'";
      #      print STDERR "isView: $sql\n";
      my $stmt = $self->getMetaDbh()->prepareAndExecute($sql);
      while (my($tn) = $stmt->fetchrow_array()) {
        $self->{realTableName} = 
	  $self->getFullClassName($self->getSchemaName()."::".$tn);
      }
    } else {
      $self->{realTableName} = $self->getClassName();
    }
  }
  return $self->{realTableName};
}

sub setRealTableName { my($self,$val) = @_; $self->{realTableName} = $val; }

sub getRealPerlTableName {
  my($self) = @_;

  return $self->getRealTableName();
}

sub getParentRelations {
  my ($self) = @_;
  if (!$self->{'parents'}) {
		my $table = $self->getDatabase()->getTable($self->getRealTableName())->getTableName();
	  my $owner = $self->getSchemaNameUpper();
		my $sql=$self->getDatabase->getDbPlatform->parentRelationsSql($owner,$table);
#		print STDERR $sql, "\n";
	  my $sth  = $self->getDbHandle()->prepareAndExecute($sql);
	  while (my($cons_owner,$selftab,$selfcol,$pkowner,$pktable,$pkcol) = $sth->fetchrow_array()) {
			$cons_owner=~tr/a-z/A-Z/;  ##upper case or else!
	    next unless $cons_owner eq $owner;  ##hack....but query runs very slowly if constrain on this!!
#                print STDERR "  returns: ($selftab,$selfcol,$pktable,$pkcol)\n";
        #        push(@{$self->{'relations'}->{$selftab}->{$selfcol}},$pkcol);
####NOTE...this willNOT work with tables in other schemas...need to somehow get the schema owner for  them!!!
	    $pktable = $self->getFullClassName($pkowner."::".$pktable);
	    next unless $pktable;
	    $selfcol =~ tr/A-Z/a-z/;
	    $pkcol =~ tr/A-Z/a-z/;
	    push(@{$self->{'parents'}},[$pktable, $selfcol, $pkcol]);
		} 
      ##now do the four generic tables AlgorithmInvocation,UserInfo,GroupInfo,Project
	  push(@{$self->{'parents'}},['GUS::Model::Core::AlgorithmInvocation','row_alg_invocation_id','algorithm_invocation_id']);
	  push(@{$self->{'parents'}},['GUS::Model::Core::GroupInfo','row_group_id','group_id']);
	  push(@{$self->{'parents'}},['GUS::Model::Core::UserInfo','row_user_id','user_id']);
	  push(@{$self->{'parents'}},['GUS::Model::Core::ProjectInfo','row_project_id','project_id']);
	}
  #  print STDERR $self->getTableName,": Parents = (",join(', ', keys%{$self->{'parents'}}),")\n";
	return $self->{'parents'};
}

sub setParentRelations {
  my($self,@rels) = @_;
  @{$self->{parents}} = @rels;
}
    

sub getChildRelations {
  my ($self) = @_;
  if (!$self->{'children'}) {
    my $table = $self->getRealTableName();
    $self->{'children'} = $self->getDatabase()->getTableChildRelations($table) if $table;
  }
  #  print STDERR $self->getTableName,": Children = (",join(', ', keys%{$self->{'children'}}),")\n";
  return $self->{'children'};
}

sub setChildRelations {
  my($self,@rels) = @_;
  @{$self->{children}} = @rels;
}

sub getPrimaryKeyAttributes {
  my ($self) = @_;
  if (!$self->{'pkChecked'} && !$self->{'primaryKeyList'}) { 
    my $tableName = $self->getRealTableName();
    my $queryTable = $self->getTableName() eq $tableName ? $self->getTableName : $self->getDatabase()->getTable($tableName,1)->getTableName();
    $queryTable =~ tr/a-z/A-Z/;
    my $owner = $self->getSchemaNameUpper();
		my $sql=$self->getDatabase->getDbPlatform->primaryKeySql($owner,$queryTable);
#    print STDERR "SQL: $sql\n";

    my $sth = $self->getMetaDbh()->prepareAndExecute($sql);
    while (my($att) = $sth->fetchrow_array()) {
      $att =~ tr/A-Z/a-z/;
      push (@{$self->{'primaryKeyList'}},$att);
    }
    $self->{'pkChecked'} = 1;
    if($self->{primaryKeyList} && scalar(@{$self->{primaryKeyList}}) == 1){
      $self->{primaryKey} = $self->{primaryKeyList}->[0];
    }
	} 
  return $self->{'primaryKeyList'};
}

sub  setPrimaryKeyList {
  my($self,@list) = @_;
  @{$self->{primaryKeyList}} = @list;
  $self->{pkChecked} = 1;
  if(scalar(@list) == 1){
    $self->{primaryKey} = $list[0];
  }
}

sub getPrimaryKey {
  my($self) = @_;
  if(!$self->{primaryKey} && !$self->{pkChecked}){
    $self->getPrimaryKeyAttributes();
  }
  return $self->{primaryKey};
}

sub getTableId {
  my($self) = @_;
  if(!$self->{table_id}){
    my $dbh = $self->getDatabase()->getMetaDbHandle();
    ### SQL CHANGE ..addin join to dbinfo###
    my $sql = "select table_id from ".$self->getDatabase()->getCoreName().".TableInfo where name = '".$self->getTableName()."'";
#    print STDERR "$sql\n";
    my $sth = $dbh->prepareAndExecute($sql);
    if (my ($id) = $sth->fetchrow_array()) {
      $self->{table_id} = $id;
    } else {
      print STDERR "ERROR: table_id for ".$self->getOracleTableName()." not found\n";
    }
  }
  return $self->{table_id};
}

sub setTableId { my($self,$val) = @_; $self->{table_id} = $val; }

sub pkIsIdentity { 
  my ($self) = @_;
  if (!$self->{'havePkIsIdentity'}) { ##haven't tested to see if identity...
    $self->{'havePkIsIdentity'} = 1;
    my @keyList = @{$self->getPrimaryKeyAttributes()};
    if (!scalar(@keyList) == 1) { 
      return 0;
    }
      #			print STDERR "DbiTable:pkIsIdentity is not implemented yet for Oracle.\n";
      return 0;

  }
  return $self->{'pkIsIdentity'};
}

sub hasSingleKey { 
  my ($self) = @_;
  my $pkList = $self->getPrimaryKeyAttributes();
  if ($pkList) {
    return  scalar( @$pkList ) == 1;
  }
  return undef;
}

sub sqlSelectAndGet {
  my ($self,$sql, $useInstanceClass) = @_;
  my $sth = $self->getDbHandle()->prepareAndExecute($sql);
  if (my $row = $sth->fetchrow_hashref('NAME_lc')) {
    if ($useInstanceClass) {
      eval("require " . $self->getInstanceClass());
      return $self->getInstanceClass()->new($row, 
                                            $self->getDatabase(), 
                                            $self->getPrimaryKeyAttributes());
    } else {
      return GUS::ObjRelP::DbiRow->new($self->getClassName(), $row, $self->getDatabase()); ###CHECK THIS!!!!
    }
  } else {
    return undef;
  }
}

sub sqlSelect {
  my ($self,$sql) = @_;
  $self->{'sth'} = $self->getDbHandle()->prepareAndExecute($sql);
  return $self->{'sth'};
}

sub getNext {
  my ($self, $useInstanceClass) = @_;
  if (my $row = $self->{'sth'}->fetchrow_hashref('NAME_lc')) {
    if ($useInstanceClass) {
      eval("require ".$self->getInstanceClass());
      return $self->getInstanceClass()->new($row, 
                                            $self->getDatabase(),
                                            $self->getPrimaryKeyAttributes());
    } else {
      return GUS::ObjRelP::DbiRow->new($self->getTableName(), $row, $self->getDatabase()); ###CHECK THIS!!!!
    }
  } else {
    return undef;
  }
}

sub getNextID {
  my ($self,$holdlock) = @_;
  if ($self->isView()) {
    print STDERR "ERROR: ".$self->getClassName()."->getNextID() is not a valid method for views\n";
    return undef;
  }
  my $result = 1;

  my $owner = $self->getSchemaNameUpper();
  my $query = $self->getDatabase->getDbPlatform->nextValSelect($self->{oracle_table_name});
  if (!exists $self->{nextidstmt}) {

    $self->{nextidstmt} = $self->getDbHandle()->prepare($query)
      || &confess("Failed preparing sql '$query' with error: " . $self->getDbHandle()->errstr());
  }  

  $self->{nextidstmt}->execute()
    || &confess("Failed executing sql '$query' with error: " . $self->getDbHandle()->errstr());

  ($result) = $self->{nextidstmt}->fetchrow_array();
  $self->{nextidstmt}->finish();
  
  return $result;
}

sub make_sql_cmd {
  my ($self,$select_list, $table, $where, $holdlock) = @_;
  my $select;
  my $holdlock_clause;
  my $att;
  if ($select_list eq "*") { 
    $select = "*";
  } else {
    foreach $att (@$select_list) {
      $select .= " $att,";
    }
    chop($select);              ## get rid of comma
  }
  # Is this same for Oracle ?
  if ($holdlock) {
    $holdlock_clause = 'holdlock';
  } else {
    $holdlock_clause='';
  }
  my $sql_where = makeWhereHavingClause($where);
  my $sql_cmd = "
    SELECT $select
    FROM   ".$self->getOracleTableName()." $holdlock_clause
    $sql_where ";
  return $sql_cmd;
}

sub makeWhereHavingClause { 
  my ($self, $clause, $isHaving, $alias) = @_;
  if (!$clause) {
    return;
  }
  my $sql_clause=undef;
  if (ref($clause) eq "HASH") { ## QUOTE CLAUSE HASH
    my $quoted_clause = $self->quoteAtts($clause);
    my $first = 1;
    foreach my $att (keys %$quoted_clause) {
      my $and = "and"; 
      my ($sign,$val);
      if ($first) {
        $sql_clause = ""; $and = ''; $first = 0;
      }
      my $attval = $quoted_clause->{$att};
      if (ref($attval) eq 'ARRAY') {
        $sign = $attval->[0]; $val = $attval->[1];
      } else {
        $sign = '='; $val = $attval;
      }
      $sql_clause .= " $and ".($alias ? "$alias." : "")."$att $sign $val ";
    }
    ## if no clause hash then actual query string passed in
  } elsif ($clause) {
    $sql_clause = " $clause ";
  }
  my $prefix = $isHaving ? 'HAVING' : 'WHERE';
  if ($sql_clause) {
    $sql_clause = "\n\t$prefix $sql_clause \n";
  }
  return $sql_clause;
}

sub quote_chars_ref {
  my (@char_atts) = @_;
  my $attrib_ref;
  foreach $attrib_ref (@char_atts) {
    if ($$attrib_ref !~ /^NULL$/i) { 
      #      my $quote;
      #      if ($$attrib_ref =~ /\"/) { $quote = "'"; }
      #      else { $quote = '"'; }
      #      $$attrib_ref = qq [$quote$$attrib_ref$quote] ; 
      $$attrib_ref =~ s/\'/''/g;
      $$attrib_ref = "'$$attrib_ref'";
    }
  }
}

sub quoteAtts {
  my ($self,$hash_ref) = @_;
  my %hash_copy = %$hash_ref;   ## actual hash copy not a ref!
  if (! $self->getQuoteHash()) {
    return \%hash_copy;
  }                             ## no quotables
  ## Loop through attributes of passed in row - keys of hash
  foreach my $attrib (keys %hash_copy) {
    if ($self->getQuoteHash()->{$attrib}) {
      $hash_copy{$attrib} = $self->getDbHandle()->quote($hash_copy{$attrib});
    }
  }
  return \%hash_copy;
}

sub getQuoteHash {              # returns attribute names that need quoting
  my ($self) = @_;
  if (!$self->{'quotedAtts'}) {
    my $attInfo = $self->getAttributeInfo();
  }
  return $self->{'quotedAtts'};
}

##methods for caching statements...has with {'insert'|'update'}->{insert_clause} keys
sub getCachedStatement {
  my($self,$type,$clause) = @_;
  #  print STDERR "GUS::ObjRelP::DbiTable->getCachedStatement($type,$clause)\n";
  return $self->{statements}->{$type}->{$clause};
}

sub cacheStatement {
  my($self,$type,$clause,$stmt) = @_;
  #  print STDERR "GUS::ObjRelP::DbiTable->cacheStatement($type,$clause,$stmt)\n";
  $self->{statements}->{$type}->{$clause} = $stmt;
}

############################################################
# SQL/Select Methods:  These methods are found here because
#          they are used to select from the database on
#          the specific class/table/view that the object
#          represents.
# NOTE:NEED TO DETERMINE BEST WAY TO HANDLE SQL WITH D.
#      DBI IS DIFF THAN SYBPERL - DUE TO INTRODUCTION OF
#      STATEMENT HANDLES. IF DON'T RETURN STATEMENT HANDLE
#      THERE IS NO WAY TO RETRIEVE DATA.  FOR EXAMPLE - 
#      CONSIDER select() - this method currently builds 
#      a sql statement and executes it.  NOTHING is returned.
#      the user then calls getNext to get the results...
#      But, now there is no way of knowing what statement
#      handle was used, so cannot retrieve the data.  Either
#      need to change sql methods to return a statement 
#      handle, or store statement handles in some way...
#      this requires some more thought...
#      this will impact how selects are performed on 
#      DbiTable objects...  actually will probably impact
#      other classes as well....   :(
#
############################################################

sub setChildList{
  my($self,@list) = @_;
  undef $self->{'childList'};
  $self->addToChildList(@list);
}

sub addToChildList{
    my($self,@list) = @_;
    foreach my $i (@list) {
	my $childFullName = $self->getFullClassName($i->[0]);
	&confess("Invalid child name: '$i->[0]'") unless $childFullName;
	@{$self->{'childList'}->{$childFullName}} = ($i->[1],$i->[2]);
    }
		}

sub getChildList{
    my $self = shift;
    return keys %{$self->{'childList'}};
}

sub getChildListWithAtts {
    my $self = shift;
    return $self->{childList};
}

sub isValidChild{
    my($self,$c) = @_;
    if (exists $self->{'childList'}->{$c->getClassName()}) {
	return 1;
    }
    return 0;
}

sub isOnChildList{
    my($self,$className) = @_;
    $className = $self->getFullClassName($className);
    if (exists $self->{'childList'}->{$className}) {
	return 1;
    }
  return 0;
}

sub getChildSelfColumn{
  my ($self,$className) = @_;
  $className = $self->getFullClassName($className);
  #	print STDERR "getChildSelfColumn: \)",join(', ',@{$self->{'childList'}->{$className}}),"\)\n";
  return $self->{'childList'}->{$className}->[0];
}

sub getChildColumn{
  my ($self,$className) = @_;
  $className = $self->getFullClassName($className);
  return $self->{'childList'}->{$className}->[1];
}

sub setParentList{
  my($self,@list) = @_;
  undef $self->{'ParentList'};
  $self->addToParentList(@list);
}

sub addToParentList{
  my($self,@list) = @_;

  foreach my $i (@list) {
    my $parentFullName = $self->getFullClassName($i->[0]);
    @{$self->{'parentList'}->{$parentFullName}} = ($i->[1],$i->[2]);
  }
}

sub getParentList{
  my $self = shift;
  return keys %{$self->{'parentList'}};
}

##returns the hash reference..
sub getParentListWithAtts {
  my $self = shift;
  return $self->{parentList};
}

sub getParentSelfColumn{
  my ($self,$className) = @_;
  $className = $self->getFullClassName($className);
  #	print STDERR "getParentSelfColumn: \)",join(', ',@{$self->{'childList'}->{$className}}),"\)\n";
  return $self->{'parentList'}->{$className}->[0];
}

sub getParentColumn{
  my ($self,$className) = @_;
  $className = $self->getFullClassName($className);
  return $self->{'parentList'}->{$className}->[1];
}

sub isValidParent{
  my($self,$p) = @_;
  if (exists $self->{'parentList'}->{$p->getClassName()}) {
    return 1;
  }
  return 0;
}

sub isOnParentList{
  my($self,$className) = @_;
  $className = $self->getFullClassName($className);
  if (exists $self->{'parentList'}->{$className}) {
    return 1;
  }
  return 0;
}

##moving from DbiRow
sub setViewsUnderlyingTable {
	my($self,$table) = @_;
	$self->{'underlyingTable'} = $table;
}
sub getViewsUnderlyingTable {
	my $self = shift;
	return $self->{'underlyingTable'};
}

##NOTE:  This is dependent specifically on the table_id of the Imp sequence tables!!
sub setHasSequence { my($self,$val) = @_; $self->{hasSequence} = $val; }

sub hasSequence {
  my($self) = @_;
  if (!defined $self->{hasSequence}) {
    $self->{hasSequence} = $self->getDatabase()->getTableHasSequence($self->getClassName());
  }
  return $self->{hasSequence}; 
}

sub getFullClassName {
  my ($self, $className) = @_;

  return $self->getDatabase()->getFullTableClassName($className);
}

sub className2oracleName {
  my ($className) = @_;
  return GUS::ObjRelP::DbiDatabase::className2oracleName($className);
}

1;



package GUS::ObjRelP::DbiDatabase;

############################################################
#
# Package:  DbiDatabase
# Description  :
#
# Modified    By                 Description
# _________________________________________________________
#
# 6/22/2000   Sharon Diskin      Created
# 6/17/2003   Jonathan Crabtree  Fixed hard-coding of rollback segment.
# 3/22/04     Jason Hackney      Moved Oracle specific SQL into
# Oracle.pm, and added support for PostgreSQL.  Metadata queries
# are now handled generically by instantiating an Oracle or
# PostgreSQL object in DbiDatabase.pm.
############################################################

use strict;
use GUS::ObjRelP::DbiDbHandle;
use GUS::ObjRelP::DbiTable;
use GUS::ObjRelP::Oracle;
use GUS::ObjRelP::PostgreSQL;
use Carp;

############################################################
# Global variable for default DbiDatabase..
############################################################
my $defDbiDb;
my $debug = 0;

############################################################
# Constructor
############################################################

sub new {
  my ($class,$dsn,$login,$password,$verbose,$noInsert,$default,$coreName,$defaultOracleRollbackSegment) = @_;
  my $self = {};
  bless $self, $class;
  $self->setDSN($dsn);

  &confess("You must supply a DbiDsn to the constructor of DbiDatabase") unless $dsn;

  # $defaultOracleRollbackSegment is optional
  if ((scalar(@_) < 8) || (scalar(@_) > 9)) {
    &confess("Invalid number of args for the DbiDatabase constructor");
  }

  $self->{coreName} = $coreName;
  $self->setPassword($password);
  $self->setLogin($login);
  $self->setVerbose($verbose);
  $self->setNoInsert($noInsert);
  $self->setDefaultOracleRollbackSegment($defaultOracleRollbackSegment);
  if ($default || !$defDbiDb) {
    $defDbiDb = $self;
  }
  ##default behavior
  $self->{exitIfAttNotRetrieved} = 0;
  $self->{printErrIfAttNotRetrieved} = 0;
  $self->setDefaultValues();
  return $self;
}

sub getDbHandle {
  my ($self) = @_;
  if ( ! exists $self->{'dbh'} ) { 
    $self->{'dbh'} = $self->makeNewHandle(0);
    $self->{'dbh'}->{'LongReadLen'} = 4000000;
  }
  return $self->{'dbh'};
}

# used for obtaining metadata - e.g. primary key info.  NOTE: the 
# methods used (JDBC methods) cannot be executed within a transaction.
# this is why we need a separate handle.
sub getMetaDbHandle {
  my ($self) = @_;
  if (!$self->{'metaDbh'}) {
    $self->{'metaDbh'} = $self->makeNewHandle(1);
  }
  return $self->{'metaDbh'};
}
sub getQueryHandle {
  my ($self,$autocommit) = @_;
  if (!$self->{'queryDbh'}) { 
    $self->{'queryDbh'} = $self->makeNewHandle($autocommit); 
    $self->{'queryDbh'}->{LongReadLen} = 4000000;
  }
  return $self->{'queryDbh'};
}


sub getDefaultDatabase { return $defDbiDb; } # static
sub setDefaultDatabase {  #static
  my ($defaultDb) = @_;
  $defDbiDb = $defaultDb;
}
sub setMeAsDefaultDatabase {
  my ($self) = @_;
  $defDbiDb = $self;
}
sub setLogin { my ($self,$lg) = @_; $self->{'login'} = $lg; }
sub getLogin { my ($self) = @_; return $self->{'login'}; }
sub setPassword { my ($self,$ps) = @_; $self->{'password'} = $ps; }
sub getPassword { my ($self) = @_; return $self->{'password'}; }
sub setVerbose { my ($self,$v) = @_; $self->{'verbose'} = $v; }
sub getVerbose { my ($self) = @_; return $self->{'verbose'}; }
sub setNoInsert { my ($self,$ni) = @_; $self->{'noInsert'} = $ni; }
sub getNoInsert { my ($self) = @_; return $self->{'noInsert'}; }
sub setDefaultOracleRollbackSegment { my ($self, $rs) = @_; $self->{'defaultOracleRollbackSegment'} = $rs; }
sub getDefaultOracleRollbackSegment { my ($self) = @_; return $self->{'defaultOracleRollbackSegment'}; }
sub setDbName { my ($self,$dbn) = @_; $self->{'dbname'} = $dbn; }
sub getDbName {  my ($self,$dbh) = @_;  return $self->{'dbname'}; }

sub setCoreName { my($self,$val) = @_; $self->{coreName} = $val; }
sub getCoreName { my($self) = @_; return $self->{coreName}; }

sub setExitOnSQLFailure{
  my ($self, $exitFlag) = @_;
  if (defined $exitFlag) {
    $self->getDbHandle()->setExitOnFailure($exitFlag);
  }
}

sub getExitOnSQLFailure{
  my ($self) = @_;
  return $self->getDbHandle()->getExitOnFailure();
}

sub setExitIfAttNotRetrieved { my($self,$val) = @_; $self->{exitIfAttNotRetrieved} = $val; }
sub getExitIfAttNotRetrieved { my $self = shift; return $self->{exitIfAttNotRetrieved}; }
sub setPrintErrIfAttNotRetrieved { my($self,$val) = @_; $self->{printErrIfAttNotRetrieved} = $val; }
sub getPrintErrIfAttNotRetrieved { my $self = shift; return $self->{printErrIfAttNotRetrieved}; }

sub setDSN { 
  my ($self,$dsn) = @_;
  if ($dsn) {
    $self->{'dsn'} = $dsn; 
  } else {
    $self->{'dsn'} = $ENV{DBI_DSN};
  }
}

sub getDSN { 
  my ($self) = @_; 
  if (!$self->{'dsn'}) {
    $self->setDSN();
  }
  return $self->{'dsn'};
}

sub getDbPlatform{
	my($self)=@_;
	if(!$self->{dbPlatform}){
		my $dsn=$self->getDSN();
		if($dsn=~/oracle/i){
			$self->{dbPlatform}=GUS::ObjRelP::Oracle->new();
		}
		elsif($dsn=~/pg/i && $dsn!~/pgpp/i){
			$self->{dbPlatform}=GUS::ObjRelP::PostgreSQL->new();
		}
		else{
			die "You are using an unsupported DB with DSN: ".$self->getDSN().". If you are using PostgreSQL with the DBD::PgPP module, please use the DBD::Pg module, instead. There are problems with the PgPP implementation.\n";
		}
	}
	return $self->{dbPlatform};
}

sub makeNewHandle { 
  my ($self, $autocommit) = @_;
  #	print STDERR "makeNewHandle($autocommit)\n";
  my $dbh = GUS::ObjRelP::DbiDbHandle->new($self->getDSN(), $self->getLogin(),$self->getPassword(),
                             $self->getVerbose(),$self->getNoInsert(), $autocommit);

  $self->_setOracleRollbackSegment($dbh);
  return $dbh;
}

##only make DbiTables
sub setUseDbiTableOnly { my($self,$val) = @_; $self->{useDbiTableOnly} = $val; }

sub getUseDbiTableOnly { my($self) = @_; return $self->{useDbiTableOnly}; }

sub getTable {
  my ($self,$className,$dbitable) = @_;

  $className = $self->getFullTableClassName($className);

  if ( ! $self->{'tables'}->{$className} ) {
      my ($sc,$tb);
      if($dbitable || $self->getUseDbiTableOnly()){
	  $self->{'tables'}->{$className} =
	      GUS::ObjRelP::DbiTable->new($className,$self);
      }else{
	  my $tableName = $className . "_Table";
	  my $evalstmt = "require $tableName";
	  print STDERR "$evalstmt\n" if $debug;
	  print STDERR "dbitable: '$dbitable'\n" if $debug;
	  eval($evalstmt);
	  $self->{'tables'}->{$className} = 
	      $tableName->new($className,$self);
      }
  }
  return $self->{'tables'}->{$className};
}

sub getDateFunction {
  my($self) = @_;
	return $self->getDbPlatform->dateFunction();
}

sub tableHasSequenceId {
  my($self,$className) = @_;

  $className = $self->getFullTableClassName($className);

  if (!exists $self->{'sequenceIdTables'}) {
		my $sql=$self->getDbPlatform->sequenceIdSql();
		my $stmt=$self->getMetaDbHandle->prepareAndExecute($sql);
    while (my($owner,$name) = $stmt->fetchrow_array()) {
      $name =~ s/_SQ$//;
      my $fullName = $self->getFullTableClassName($owner."::".$name);
      $self->{'sequenceIdTables'}->{$fullName} = 1;
    }
  }

  return $self->{'sequenceIdTables'}->{$className};
}

##case INSENSITIVE test for existence of tablename
sub checkTableExists {
  my($self,$className) = @_;

  $className = $self->getFullTableClassName($className);

  if (!exists $self->{'tableExists'}) {
    $self->cacheTableNames();
  }

  return exists $self->{'tableExists'}->{$className};
}

sub cacheTableNames {
  my ($self) = @_;
  my $sql = "select d.name,t.name,t.is_view from ".$self->getCoreName().".TableInfo t, ".$self->getCoreName().".DatabaseInfo d where d.database_id = t.database_id";
  my $stmt = $self->getMetaDbHandle()->prepareAndExecute($sql);
  while (my($schema,$name,$isView) = $stmt->fetchrow_array()) {
    my $fullName = "GUS::Model::${schema}::${name}";
    my $lowerName = "${schema}::${name}";
    $lowerName =~ tr/a-z/A-Z/;
    $self->{'allTables'}->{"$isView"}->{$fullName} = 1;
    $self->{'fullClassNames'}->{$lowerName} = $fullName;
    $self->{tableExists}->{$fullName} = 1;
  }
}

sub getTableNames { 
  my ($self) = @_; 
  $self->cacheTableNames() unless exists $self->{'allTables'};
  my @tables;
  foreach my $n (keys%{$self->{'allTables'}->{'0'}}) {
    push(@tables,$n) if $self->checkTableExists($n);
  }
  return \@tables;
}

sub getViewNames { 
  my ($self) = @_; 
  $self->cacheTableNames() unless exists $self->{'allTables'};
  my @tables;
  foreach my $n (keys%{$self->{'allTables'}->{'1'}}) {
    push(@tables,$n) if $self->checkTableExists($n);
  }
  return \@tables;
}

sub getTableAndViewNames { 
  my ($self) = @_; 
  $self->cacheTableNames() unless exists $self->{'allTables'};
  my @tables;
  foreach my $n (keys%{$self->{'allTables'}}) {
    foreach my $t (keys%{$self->{'allTables'}->{$n}}) {
      push(@tables,$t) if $self->checkTableExists($t);
    }
  }
  return \@tables;
}


##oracle is very slow to get child relations...thus do here for all and cache
##NEED to special case the 4 core  tables as no longer have fk constraints 4/8/02
sub getTableChildRelations {
  my($self,$className) = @_;

  $className = $self->getFullTableClassName($className);

  my $owner = $self->getTable($className)->getSchemaNameUpper();
  if (!exists $self->{'allChildRelations'}->{$owner}) {
		my $sql=$self->getDbPlatform->tableChildRelationsSql($owner);
#    print STDERR "getChildRelations sql: $sql\n";
    my $sth  = $self->getDbHandle()->prepareAndExecute($sql);
    while (my($ftowner,$stowner,$selftab,$selfcol,$fktable,$fkcol) = $sth->fetchrow_array()) {
#            print STDERR "  returns: ($selftab,$selfcol,$fktable,$fkcol)\n";
      $fktable = $self->getFullTableClassName($ftowner.'::'.$fktable);
      $selftab = $self->getFullTableClassName($stowner.'::'.$selftab);
      next unless $fktable && $selftab;     ##did not return from getPrettyTableName...won't be an object..
      $selfcol =~ tr/A-Z/a-z/;
      $fkcol =~ tr/A-Z/a-z/;
#      print STDERR "Caching ChildRelations: $selftab - [$fktable, $selfcol, $fkcol]\n";
      push(@{$self->{'allChildRelations'}->{$owner}->{$selftab}},[$fktable, $selfcol, $fkcol]);
    }
    $self->cacheFourCoreChildRelations($owner);
  }
  return $self->{'allChildRelations'}->{$owner}->{$className};
}

sub cacheFourCoreChildRelations {
  my($self,$owner) = @_;
  my $core = $self->getCoreName();
  return unless $owner =~ /$core/i;
  my $allTables = $self->getTableAndViewNames();
  my %fk = ( 'AlgorithmInvocation' => 'row_alg_invocation_id',
             'GroupInfo' => 'row_group_id',
             'ProjectInfo' => 'row_project_id',
             'UserInfo' => 'row_user_id');
  my %pk = ( 'AlgorithmInvocation' => 'algorithm_invocation_id',
             'GroupInfo' => 'group_id',
             'ProjectInfo' => 'project_id',
             'UserInfo' => 'user_id');
  foreach my $t ('AlgorithmInvocation','GroupInfo','ProjectInfo','UserInfo'){
    my $tableName = $self->getFullTableClassName($self->getCoreName()."::$t");
    foreach my $rel (@{$allTables}){
      next if $rel =~ /Ver$/;
      push(@{$self->{'allChildRelations'}->{$owner}->{$tableName}},[$rel, $pk{$t}, $fk{$t}]);
    }
  }
}

sub logout {
  my ($self) = @_;
  if ($self->{'dbh'}) { 
    $self->{'dbh'}->rollback(); ##rolls back anything that  has not been committed
    $self->{'dbh'}->disconnect(); 
  }
  if ($self->{'metaDbh'}) {
    $self->{'metaDbh'}->disconnect();
  }
  if ($self->{'queryDbh'}) {
    $self->{'queryDbh'}->disconnect();
  }
}

#############################################################
# Moving Row global variables to DbiDatabase
#############################################################

##called by constructor to setup the default values...
sub setDefaultValues {
  my $self = shift;
  $self->setDefaultGroupId(0);
  $self->setDefaultProjectId(0);
  $self->setDefaultUserRead(1);
  $self->setDefaultUserWrite(1);
  $self->setDefaultGroupRead(1);
  $self->setDefaultGroupWrite(1);
  $self->setDefaultOtherRead(1);
  $self->setDefaultOtherWrite(0);
  $self->setMaximumNumberOfObjects(10000); ##the default maximum number of objects....
  $self->{globalDeleteEvidence} = 0;  ##default is to not  delete evidence..
  $self->{globalDeleteSimilarity} = 1; ##default is to always delete similarities 
  $self->setGlobalNoVersion(0);
  $self->setCommitState(1);
  $self->{xmlId} = 1000;        ##first value for xmlId
}

sub setDefaultProjectId { my($self,$project_id) = @_; $self->{defaultProjectId} = $project_id; }
sub getDefaultProjectId { my($self) = @_; return $self->{defaultProjectId}; }
sub setDefaultUserId { my($self,$op_id) = @_; $self->{defaultUserId} = $op_id; }
sub getDefaultUserId { my($self) = @_; return $self->{defaultUserId}; }
sub setDefaultGroupId { my($self,$op_id) = @_; $self->{defaultGroupId} = $op_id; }
sub getDefaultGroupId { my($self) = @_; return $self->{defaultGroupId}; }
sub setDefaultAlgoInvoId { my($self,$op_id) = @_; $self->{defaultAlgoInvoId} = $op_id; }
sub getDefaultAlgoInvoId { my($self) = @_; return $self->{defaultAlgoInvoId}; }

##globalNoVerison methods.
sub setGlobalNoVersion { my($self,$val) = @_; $self->{globalNoVersion} = $val; }
sub getGlobalNoVersion { my($self) = @_; return $self->{globalNoVersion}; }

##read write methods..
sub setDefaultUserRead { my($self,$read) = @_; $self->{defaultUserRead} = $read; }
sub getDefaultUserRead { my($self) = @_; return $self->{defaultUserRead}; }
sub setDefaultUserWrite { my($self,$val) = @_; $self->{defaultUserWrite} = $val; }
sub getDefaultUserWrite { my($self) = @_; return $self->{defaultUserWrite}; }
sub setDefaultGroupRead { my($self,$val) = @_; $self->{defaultGroupRead} = $val; }
sub getDefaultGroupRead { my($self) = @_; return $self->{defaultGroupRead}; }
sub setDefaultGroupWrite { my($self,$val) = @_; $self->{defaultGroupWrite} = $val; }
sub getDefaultGroupWrite { my($self) = @_; return $self->{defaultGroupWrite}; }
sub setDefaultOtherRead { my($self,$val) = @_; $self->{defaultOtherRead} = $val; }
sub getDefaultOtherRead { my($self) = @_; return $self->{defaultOtherRead}; }
sub setDefaultOtherWrite { my($self,$val) = @_; $self->{defaultOtherWrite} = $val; }
sub getDefaultOtherWrite { my($self) = @_; return $self->{defaultOtherWrite}; }

############################################################
# methods for maximum number of objects 
############################################################
sub setMaximumNumberOfObjects {
  my($self,$num) = @_;
  print STDERR "Maximum number of ".$self->getDbName()." objects set to $num\n" unless $num == 10000;
  $self->{maxNumberOfObjects} = $num;
}

sub getMaximumNumberOfObjects {
  my($self) = @_;
  return $self->{maxNumberOfObjects};
}

sub setGlobalDeleteEvidenceOnDelete { 
  my($self,$val) = @_; 
  print STDERR "Setting global delete EvidenceOnDelete to $val\n";
  $self->{globalDeleteEvidence} = $val; 
}
sub getGlobalDeleteEvidenceOnDelete { my($self) = @_; return $self->{globalDeleteEvidence}; }

sub setGlobalDeleteSimilarityOnDelete { 
  my($self,$val) = @_; 
  print STDERR "Setting global delete SimilarityOnDelete to $val\n";
  $self->{globalDeleteSimilarity} = $val; 
}
sub getGlobalDeleteSimilarityOnDelete { my($self) = @_; return $self->{globalDeleteSimilarity}; }

sub getTransactionId { my $self = shift; return $self->{transaction_id}; }

##begins and commits tranactions.....so can over-ride the submit method and still deal
##with the commit state appropriately
sub manageTransaction {
  my($self,$noTran,$task) = @_;
  if ($noTran) {
    return 1;
  }
  if ($task =~ /begin/i) {
    $self->{transaction_id}++;  ##increment the transction_id for versioning purposes.
    ##oracle does not need this if autocommit == 0
    $self->getDbHandle()->setRollBack(0); 
  } elsif ($task =~ /commit/i) {
    if ($self->getCommitState() && !$self->getDbHandle()->getRollBack()) {
        $self->getDbHandle()->commit();
      $self->_setOracleRollbackSegment($self->getDbHandle());
    } elsif ($self->getDbHandle()->getRollBack() ) {
      print STDERR "ERROR: submit failed...rollBack = 1...being rolled back\n";
        $self->getDbHandle()->rollback();
      $self->_setOracleRollbackSegment($self->getDbHandle());
      return 0;                 ##will cause the return value of submit to be 0
    }
  } else {
    &confess("ERROR: ".$self->getClassName()."->manageTransaction() - invalid task '$task'...options (begin|commit)\n"); 
  }
  return 1;
}

sub getTotalUpdates { my($self) = @_; return $self->{countTotalUpdates}; }
sub incrementTotalUpdates {my($self) = @_; $self->{countTotalUpdates}++; }
sub getTotalInserts { my($self) = @_; return $self->{countTotalInserts}; }
sub incrementTotalInserts {my($self) = @_; $self->{countTotalInserts}++; }
sub getTotalDeletes { my($self) = @_; return $self->{countTotalDeletes}; }
sub incrementTotalDeletes {my($self) = @_; $self->{countTotalDeletes}++; }

sub setCommitState { my($self,$val) = @_; $self->{commit} = $val; }
sub getCommitState { my($self) = @_; return $self->{commit}; }

## hash to hold the actual objects....all objects are retrieved from here given the object reference
sub addToPointerCache {
  my($self,$ob) = @_;
  return unless $ob;
  if (scalar(keys%{$self->{pointers}}) > $self->getMaximumNumberOfObjects()) {
    &confess("You have exceeded the maximum number of allowable objects in memory:\n  You must use the method 'undefPointerCache()' in each loop \n    to clear the cache and allow garbage collection!!\n If you need > ".$self->getMaximumNumberOfObjects()." objects at one time, \n   then increase the default number with the method 'setMaximumNumberOfObjects(<number>)'");
  }
  $self->{pointers}->{$ob} = $ob;
}

sub getFromPointerCache {
  my($self,$ref) = @_;
  return $self->{pointers}->{$ref};
}

sub removeFromPointerCache {
  my($self,$ob) = @_;
  delete $self->{pointers}->{$ob};
}

##use at bottom of loop to entirely clean up and allow garbage collection.
sub undefPointerCache {
  my $self = shift;
  undef %{$self->{pointers}};
  undef %{$self->{xmlHash}};    #3undefs hash of xml objects...
  undef %{$self->{dbCache}};    # undefs dbCache hash...
}

##global cache of db objects....convenience methods.
##note that am putting the object as value of hash rather than
## the hash ref value...
sub addToDbCache {
  my($self,$o,$replace) = @_;
  my $pk = $o->getConcatPrimKey();
  print STDERR "GUS::ObjRelP::DbiDatabase->addToDbCache: adding ".$o->getClassName()." $pk\n" if $debug;
  if (!$replace && exists $self->{dbCache}->{$o->getClassName()}->{$pk}) {
    print STDERR $o->getClassName()."->addToDbCache: ".$o->getConcatPrimKey()." already in cache\n" if $debug;
    return undef;
  }
  $self->{dbCache}->{$o->getClassName()}->{$pk} = $o;
  print STDERR $self->getClassName()."->addToDbCache: ".$o->getClassName()." $pk added\n" if $debug;
  return 1;
}

sub getFromDbCache {
  my($self,$class,$key) = @_;
  print STDERR $self->getClassName()."->getFromDbCache($class,$key)\n" if $debug;
  return $self->{dbCache}->{$class}->{$key};
}

sub isInDbCache {
  my($self,$class,$key) = @_;
  print STDERR $self->getClassName()."->isFromDbCache($class,$key)\n" if $debug;
  return exists $self->{dbCache}->{$class}->{$key}
}

sub removeFromDbCache {
  my($self,$o) = @_;
  print STDERR $self->getClassName()."->removeFromDbCache($o)\n" if $debug;
  delete $self->{dbCache}->{$o->getClassName()}->{$o->getConcatPrimKey()};
}

sub undefDbCache {
  my $self = shift;
  undef %{$self->{dbCache}};
}

sub getNextXmlId { my $self = shift; $self->{xmlId}++; return $self->{xmlId}; }

sub addToXmlHash {
  my($self,$o) = @_;
  $self->{xmlHash}->{$o->getXmlId()} = "$o";
}

sub getFromXmlHash {
  my($self,$id) = @_;
  return $self->getFromPointerCache($self->{xmlHash}->{$id});
}

sub getTableNameFromTableId {
  my($self,$table_id) = @_;
  if (!exists $self->{tableIdMapping}->{$table_id}) {
    ##query for it...
    my $dbh = $self->getMetaDbHandle();
    ### SQL CHANGE ###
    my $sth = $dbh->prepareAndExecute("select d.name,t.name from ".$self->getCoreName().".TableInfo t, ".$self->getCoreName().".DatabaseInfo d where t.table_id = $table_id and t.database_id = d.database_id");
    if (my ($schema,$name) = $sth->fetchrow_array()) {
      my $tn = $self->getFullTableClassName("${schema}::${name}");
      $self->{tableIdMapping}->{$table_id} = $tn;
    } else {
      &confess("ERROR: tableName for $table_id not found");
    }
  }
  return $self->{tableIdMapping}->{$table_id};
}


sub isSuperClass {
  my($self,$className) = @_;

  $className = $self->getFullTableClassName($className);

  if (!exists $self->{superClasses}) {
    $self->getSuperClasses();
  }
  return exists $self->{superClasses}->{$className};
}

sub getSuperClasses {
  my $self = shift;
  if (!exists $self->{superClasses}) {
    my $cmd = "select d.name,t2.name as superclass,t1.name as subclass from ".$self->getCoreName().".TableInfo t1,".$self->getCoreName().".TableInfo t2, ".$self->getCoreName().".DatabaseInfo d where t2.table_id = t1.view_on_table_id and t1.name not like '%Ver' and d.database_id = t2.database_id";
    my $sth = $self->getQueryHandle()->prepareAndExecute($cmd);
    while (my ($schema,$sc,$tn) = $sth->fetchrow_array()) {
      $sc = $self->getFullTableClassName("${schema}::$sc");
      $tn = $self->getFullTableClassName("${schema}::$tn");
      $sc =~ s/Imp$//;
      next if $sc eq $tn;  
      #			print STDERR "getSuperClasses: $sc <- $tn\n";
      push(@{$self->{superClasses}->{$sc}},$tn);
    }
    foreach my $class (keys %{$self->{superClasses}}) {
      push(@{$self->{superClasses}->{$class}},$class);
    }
  }
  return keys %{$self->{superClasses}};
}

sub getSubClasses {
  my($self,$superClassName) = @_;

  $superClassName = $self->getFullTableClassName($superClassName);

  $superClassName =~ s/Imp$//;
  if (!exists $self->{superClasses}) {
    $self->getSuperClasses();
  }
  return @{$self->{superClasses}->{$superClassName}};
}

sub getTableHasSequence {
  my($self,$className) = @_;

  $className = $self->getFullTableClassName($className);

  if (!defined $self->{tableHasSequence}) {
    my $dbh = $self->getMetaDbHandle();
    my $sth = $dbh->prepareAndExecute("select d.name,t.name from ".$self->getCoreName().".TableInfo t, ".$self->getCoreName().".DatabaseInfo d where t.view_on_table_id in (19,159) and t.database_id = d.database_id");
    while (my($schema,$name) = $sth->fetchrow_array()) {
      my $fullName = $self->getFullTableClassName("${schema}::${name}");
      $self->{tableHasSequence}->{$fullName} = 1;
    }
  }
  return $self->{tableHasSequence}->{$className}; 
}

##NOTE:  This is dependent specifically on the table_id of the Imp sequence tables!!
# sub hasSequence {
#   my($self,$tn) = @_;
#   if (!$self->{hasSequenceList}) {
#     my $sth = $self->getMetaDbHandle()->prepareAndExecute("select d.name,t.name from ".$self->getCoreName().".TableInfo t, ".$self->getCoreName().".DatabaseInfo d  where view_on_table_id in (19,159) and t.database_id = d.database_id");
#     while (my($schema,$name) = $sth->fetchrow_array()) {
# #      print STDERR "hasSequence: $schema"."::"."$name\n";
#       $self->{hasSequenceList}->{$schema."::".$name} = 1;
#     }
#   }
#   return $self->{hasSequenceList}->{$tn} ? 1 : 0; 
# }


# input:
#  - full class name (just returned as is)
#  - or schema::table, (case ignored)
# output: full class name w/ proper case, ie GUS::Model:Schema:Table
# return null if not an actual table.
sub getFullTableClassName {
  my ($self, $className) = @_;

  if (!exists $self->{'fullClassNames'}) {
    $self->cacheTableNames();
  }

  if ($className =~ /^GUS::Model::(.*)/) {
    $className = $1;
  }

  &confess("Illegal className '$className' (not in schema::table form)")
    unless ($className =~ /\w+::\w+/);

  $className =~ tr/a-z/A-Z/;
  return $self->{'fullClassNames'}->{$className};
}

sub className2oracleName {
  my ($className) = @_;

  $className =~ s/GUS::Model:://;
  &confess("Illegal className $className (not in schema::table format)")
    unless $className =~ /\w+::\w+/;
  $className =~ s/::/./;
  return $className;
}

############################################################
# "Private" functions
############################################################

# Only used in Oracle; resets the current transaction's rollback segment
# to getDefaultOracleRollbackSegment().  Must be called at the beginning
# of every transaction in which the default rollback segment is to be used.
# Does nothing unless the current setting of getDSN() indicates that we
# are connected to an Oracle database.  Also does nothing if the current
# value of getDefaultOracleRollbackSegment is "none" (e.g., if the current
# Oracle instance is using AUTO undo management instead of rollback segments,
# or the user does not wish to change his/her default rollback segment.)
#
sub _setOracleRollbackSegment {
    my($self, $dbh) = @_;

    if ($self->getDSN() =~ /oracle/i) {
	my $rbs = $self->getDefaultOracleRollbackSegment();

	# Can't specify a rollback segment named "none".  Probably not a bad thing.
	if (($rbs =~ /\S+/) && !($rbs =~ /^none$/i)) {
	    $dbh->do("set transaction use rollback segment $rbs");
	}
    }
}


1;

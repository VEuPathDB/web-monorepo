package GUS::Model::GusRow;

###########################################
#
# This module is a super class that all GUS tables should subclass
# as it provides the methods for dealing with simple relationships
# 1 to many and many to 1 (parent - child)
# 
# Brian Brunk 12/10/1999
# 
###########################################

use strict;
use GUS::ObjRelP::DbiRow;
use GUS::Model::DoTS::Evidence;
use GUS::Model::DoTS::Similarity;
use CBIL::Bio::SequenceUtils;


use vars qw (@ISA);
@ISA = qw (GUS::ObjRelP::DbiRow);

sub new {
  my($class,$attributeHash,$dbiDatabase,$pkList) = @_;
  my $self = GUS::ObjRelP::DbiRow->new($class,$attributeHash,$dbiDatabase,$pkList);
  bless $self,$class;
  $self->setDefaultParams();
  $self->getDatabase()->addToPointerCache($self);
  if ($self->allNonNullsSet()) { ##this means that the sybtable hashref passed in came from db...
    $self->getDatabase()->addToDbCache($self);
  }
  return $self;
}

############################################################
# global variables shared by all objects...these must all be moved into dbiDatabase..
############################################################

my $debug = 0;

sub setDefaultProjectId { my($self,$project_id) = @_; $self->getDatabase()->setDefaultProjectId($project_id); }
sub getDefaultProjectId { my($self) = @_; return $self->getDatabase()->getDefaultProjectId(); }
sub setDefaultUserId { my($self,$op_id) = @_; $self->getDatabase()->setDefaultUserId($op_id); }
sub getDefaultUserId { my($self) = @_; return $self->getDatabase()->getDefaultUserId(); }
sub setDefaultGroupId { my($self,$op_id) = @_; $self->getDatabase()->setDefaultGroupId($op_id); }
sub getDefaultGroupId { my($self) = @_; return $self->getDatabase()->getDefaultGroupId(); }
sub setDefaultAlgoInvoId { my($self,$op_id) = @_; $self->getDatabase()->setDefaultAlgoInvoId($op_id); }
sub getDefaultAlgoInvoId { my($self) = @_; return $self->getDatabase()->getDefaultAlgoInvoId(); }

##globalNoVerison methods.
sub setGlobalNoVersion { my($self,$val) = @_; $self->getDatabase()->setGlobalNoVersion($val); }
sub getGlobalNoVersion { my($self) = @_; return $self->getDatabase()->getGlobalNoVersion(); }

##Deleting Evidence on delete
## First Global..
sub setGlobalDeleteEvidenceOnDelete { 
  my($self,$val) = @_; 
  $self->getDatabase()->setGlobalDeleteEvidenceOnDelete($val); 
}
sub getGlobalDeleteEvidenceOnDelete { my($self) = @_; return $self->getDatabase()->getGlobalDeleteEvidenceOnDelete(); }
##also instance variable...default is to always delete evidence
sub setDeleteEvidenceOnDelete { my($self,$val) = @_; $self->{deleteEvidence} = $val; }
sub getDeleteEvidenceOnDelete { my($self) = @_; return $self->{deleteEvidence}; }

##Deleting Similarity on delete
## First Global..
sub setGlobalDeleteSimilarityOnDelete { 
  my($self,$val) = @_; 
  $self->getDatabase()->setGlobalDeleteSimilarityOnDelete($val); 
}
sub getGlobalDeleteSimilarityOnDelete { my($self) = @_; return $self->getDatabase()->getGlobalDeleteSimilarityOnDelete(); }
##also instance variable...default is to always delete evidence
sub setDeleteSimilarityOnDelete { my($self,$val) = @_; $self->{deleteSimilarity} = $val; }
sub getDeleteSimilarityOnDelete { my($self) = @_; return $self->{deleteSimilarity}; }
##methods for setting and manipulating the read/write permissions....will need to 
##check when reading and writing the db

sub setDefaultUserRead { my($self,$read) = @_; $self->getDatabase()->setDefaultUserRead($read); }
sub getDefaultUserRead { my($self) = @_; return $self->getDatabase()->getDefaultUserRead(); }
sub setDefaultUserWrite { my($self,$val) = @_; $self->getDatabase()->setDefaultUserWrite($val); }
sub getDefaultUserWrite { my($self) = @_; return $self->getDatabase()->getDefaultUserWrite(); }
sub setDefaultGroupRead { my($self,$val) = @_; $self->getDatabase()->setDefaultGroupRead($val); }
sub getDefaultGroupRead { my($self) = @_; return $self->getDatabase()->getDefaultGroupRead(); }
sub setDefaultGroupWrite { my($self,$val) = @_; $self->getDatabase()->setDefaultGroupWrite($val); }
sub getDefaultGroupWrite { my($self) = @_; return $self->getDatabase()->getDefaultGroupWrite(); }
sub setDefaultOtherRead { my($self,$val) = @_; $self->getDatabase()->setDefaultOtherRead($val); }
sub getDefaultOtherRead { my($self) = @_; return $self->getDatabase()->getDefaultOtherRead(); }
sub setDefaultOtherWrite { my($self,$val) = @_; $self->getDatabase()->setDefaultOtherWrite($val); }
sub getDefaultOtherWrite { my($self) = @_; return $self->getDatabase()->getDefaultOtherWrite(); }

############################################################
# methods for maximum number of objects 
############################################################
sub setMaximumNumberOfObjects {
  my($self,$num) = @_;
  $self->getDatabase()->setMaximumNumberOfObjects($num);
}

sub getMaximumNumberOfObjects {
  my($self) = @_;
  return $self->getDatabase()->getMaximumNumberOfObjects();
}


##################################################
# query handle...
##################################################

sub getQueryHandle {
  my($self,$autocommit) = @_;
  return $self->getDatabase()->getQueryHandle($autocommit);
}

sub closeQueryHandle {
  my($self) = @_;
  if ($self->getDatabase()->{'queryDbh'}) {
    $self->getDatabase()->{'queryDbh'}->disconnect(); 
    undef $self->getDatabase()->{'queryDbh'};
  }
}


##################################################
# methods for algorithm_invocation things..
##################################################

#sub createNewAlgorithmInvocation {
#  my($self,$algImpId,$result,$tAlgInvoId) = @_;
#  my $algInvoId = $tAlgInvoId ? $tAlgInvoId : 1; ##1 is unknown...
#  my $res = $result ? $result : "pending";
#  my $algTable = $self->getFullTableClassName($self->getDatabase()->getCoreName()."::AlgorithmInvocation");
#  eval("require $algTable");
#  return $algTable->new({'algorithm_imp_id' => $algImpId,
#                                   'start_time' => $self->getDatabase()->getDateFunction(),
#                                   'end_time' => '01/01/1900',
#                                   'row_alg_invocation_id' => $algInvoId,
#                                   'result' => $res},$self->getDatabase());
#
#}


sub checkReadPermission {
  my($self) = @_;
  ##for testing without permissions
  #	return 1;

  ##first make certain that table has these attributes..
  #	return 1 unless $self->isValidAttribute('other_read');

  ##others...
  if ($self->get('other_read')) {
    return 1;
  }                             ##anyone can read this row...
  ##group...
  if ($self->get('row_group_id') == $self->getDefaultGroupId() && $self->get('group_read')) {
    return 1;
  } 
  ##user
  if (!defined $self->getDefaultUserId()) {
    print STDERR "defaultUserId must be set\n"; return 0;
  }
  if ($self->get('row_user_id') == $self->getDefaultUserId() && $self->get('user_read')) {
    return 1;
  } 
  if (!defined $self->getDefaultGroupId()) {
    print STDERR "defaultGroupId must be set\n"; return 0;
  }
  return 0;
}

sub checkWritePermission {
  my($self) = @_;

  ##first make certain that table has these attributes..
  #	return 1 unless $self->isValidAttribute('other_write');

  ##others...
  if ($self->get('other_write')) {
    return 1;
  }                             ##anyone can read this row...
  ##group...
  if (!defined $self->getDefaultGroupId()) {
    print STDERR "defaultGroupId must be set\n"; return 0;
  }
  if ($self->get('row_group_id') == $self->getDefaultGroupId() && $self->get('group_write')) {
    return 1;
  } 
  ##user
  if (!defined $self->getDefaultUserId()) {
    print STDERR "defaultUserId must be set\n"; return 0;
  }
  if ($self->get('row_user_id') == $self->getDefaultUserId() && $self->get('user_write')) {
    return 1;
  } 
  print STDERR "Insufficient permissions to update ".$self->getClassName()." ".$self->getId()."\n";
  if ( $debug == 1 ) {
      print STDERR "other_write: ".$self->get('other_write')."\n";
      print STDERR "group_write: ".$self->get('group_write')." row_group_id: ".$self->get('row_group_id')." default_group_id: ".$self->getDefaultGroupId()."\n";
      print STDERR "user_write: ".$self->get('user_write')." row_user_id: ".$self->get('row_user_id')." default_user_id: ".$self->getDefaultUserId()."\n";
  }
     
  return 0;
}

##methods to turn GusRow debugging on and off
sub setDebuggingOn { my $self = shift; $debug = 1; }
sub setDebuggingOff { my $self = shift; $debug = 0; }
sub getDebuggingState { my $self = shift; return $debug; }

##setting verbose mode on and off...
sub setVerboseOn { my $self = shift; $self->getDatabase()->setVerbose(1); }
sub setVerboseOff { my $self = shift; $self->getDatabase()->setVerbose(0); }
sub getVerboseState { my $self = shift; return $self->getDatabase()->getVerbose(); }

##if commit is turned off, will do insert but not commit the transactions...use for debugging only and then
##for just a few loops...it generates ids appropriately...
sub setCommitOff { my $self = shift; $self->getDatabase()->setCommitState(0); }
sub setCommitOn { my $self = shift; $self->getDatabase()->setCommitState(1);}
sub getCommitState { my $self = shift; return $$self->getDatabase()->getCommitState(); }


##want to recursively remove all circular references....
##try just deleting the references to children...and parents...
sub removeAllChildPointers {
  my($self,$recursive) = @_;
  print STDERR $self->getClassName() . "->removeAllChildPointers()\n" if $debug == 1;
  if ($recursive) {
    foreach my $c ($self->getAllChildren()) {
      $c->removeAllChildPointers($recursive);
    }
  }
  delete $self->{'children'};
  delete $self->{'childrenDbList'};
}

##should likely not use the following....
sub addToPointerCache {
  my($self,$ob) = @_;
  my $obj = defined $ob ? $ob : $self;
  $self->getDatabase()->addToPointerCache($obj);
}

sub getFromPointerCache {
  my($self,$ref) = @_;
  return $self->getDatabase()->getFromPointerCache($ref);
}

sub removeFromPointerCache {
  my($self,$ob) = @_;
  $self->getDatabase()->removeFromPointerCache($ob);
}

##use at bottom of loop to entirely clean up and allow garbage collection.
sub undefPointerCache {
  my $self = shift;
  $self->getDatabase()->undefPointerCache();
  delete $self->{'submitList'};
}

##global cache of db objects....convenience methods.
##note that am putting the object as value of hash rather than
## the hash ref value...
sub addToDbCache {
  my($self,$o,$replace) = @_;
  return $self->getDatabase()->addToDbCache($o,$replace);
}

sub getFromDbCache {
  my($self,$class,$key) = @_;
  return $self->getDatabase()->getFromDbCache($class,$key);
}

sub isInDbCache {
  my($self,$class,$key) = @_;
  return $self->getDatabase()->isInDbCache($class,$key);
}

sub removeFromDbCache {
  my($self,$o) = @_;
  $self->getDatabase()->removeFromDbCache($o);
}

sub undefDbCache {
  my $self = shift;
  $self->getDatabase()->undefDbCache();
}

##over-ride retrieveFromDB so can get from dbcache if already have...
##$doNotRetrieveAtts specifies attributes that should not be retrieved...
sub retrieveFromDB {
  my($self,$doNotRetrieveAtts,$replaceCache) = @_;

  ##if $doNotRetrieveAtts check to make certain is not "1" for replaceCache...
  if($doNotRetrieveAtts && ref($doNotRetrieveAtts) ne "ARRAY"){
    $replaceCache = 1;
  }

  if ($debug) {
    print STDERR $self->getClassName()."->retrieveFromDB(\$doNotRetrieveAtts=";
    if ($doNotRetrieveAtts && ref($doNotRetrieveAtts) eq 'ARRAY') {
      print STDERR '(', join(', ', @$doNotRetrieveAtts), ')';
    } else {
      print STDERR $doNotRetrieveAtts;
    }
    print STDERR ",$replaceCache)\n";
  }

  ##could check cache first if has primary key...
  if ($self->SUPER::retrieveFromDB(ref($doNotRetrieveAtts) eq "ARRAY" ? $doNotRetrieveAtts : undef )) {
    if (!$self->checkReadPermission()) {
      ##don't have priviledges to read this one!!
      print STDERR $self->getClassName()."->retrieveFromDB(): ".$self->getId()." INSUFFICIENT PERMISSIONS TO READ THIS ENTRY\n";
      undef %{$self};
      return 0;
    }
    $self->addToDbCache($self,$replaceCache); ##add self to db cache...
    return 1;
  } else {
    return 0;
  }
}

#######################################
# some class variables for keeping track of children and parents
# want to have a list of valid parents and children.  I am now thinking
# that we should generalize the parent and child methods which will greatly
# facillitate dealing with them as a set such as for submits to db...
# 
# Code generation should also be much simpler as will then need to only create
# the appropriate class data structures below which are essentially a list of
# valid parents and children...could maintain as a hash to make testing if exists easier
# 
# Will have this one super class that all classes inherit from and add the list
# of valid children and getter and setters for attributes...
#######################################


=pod

=head1 Methods for keeping track of what classes are valid parents and children.

It is the responsibility of any subclasses to set the childList and parentList.
This could be most simply done in the constructor where both setChildList([list of classNames])
and setParentList([list of classNames]) should be called.  Sub-subClasses would call the
addToChildList and addToParentList methods.

The subclass also should set whether it is versionable (default if not set is 1) with setVersionable(1|0)  1=version,0=noVersion
    
The subclass should also set isUpdateable (default if not set is 1).  If setUpdateable is set to 0
then upon submit, all children will be submitted and relationships maintained but no inserts,
deletes, or updates will occur on self.

=cut

sub setVersionable{
  my($self,$v) = @_;
  if ($v != 0) {
    $self->{'doVersion'} = 1;
  } else {
    $self->{'doVersion'} = 0;
  }
}

sub isVersionable{
  my $self = shift;
  if ($self->getGlobalNoVersion()) {
    return 0;
  } else {
    return $self->{'doVersion'};
  }
}

sub setUpdateable{
  my($self,$u) = @_;
  if ($u != 0) {
    $self->{'doUpdate'} = 1;
  } else {
    $self->{'doUpdate'} = 0;
  }
}

sub isUpdateable{
  my $self = shift;
  return $self->{'doUpdate'};
}

sub getChildList{
  my $self = shift;
  return $self->getTable()->getChildList();
}

sub isValidChild{
  my($self,$childObject) = @_;
  return $self->getTable()->isValidChild($childObject);
}

sub checkChild {
  my($self,$childObject) = @_;

  die "Error:  attempting to access a child '". $childObject->getClassName() . "' of table '" . $self->getClassName() . "' , but that table does not have a child of that type."
    unless $self->isValidChild($childObject);
}

sub isOnChildList{
  my($self,$className) = @_;
  return $self->getTable()->isOnChildList($className);
}

sub getChildSelfColumn{
  my ($self,$className) = @_;
  return $self->getTable()->getChildSelfColumn($className);
}

sub getChildColumn{
  my ($self,$className) = @_;
  return $self->getTable()->getChildColumn($className);
}

sub getParentList{
  my $self = shift;
  return $self->getTable()->getParentList();
}

sub getParentSelfColumn{
  my ($self,$className) = @_;
  return $self->getTable()->getParentSelfColumn($className);
}

sub getParentColumn{
  my ($self,$className) = @_;
  return $self->getTable()->getParentColumn($className);
}

sub isValidParent{
  my($self,$p) = @_;
  return $self->getTable()->isValidParent($p);
}

sub checkParent {
  my($self,$parentObject) = @_;

  die "Error:  attempting to access a parent '". $parentObject->getClassName() . "' of table '" . $self->getClassName() . "' , but that table does not have a parent of that type."
    unless $self->isValidParent($parentObject);
}

sub isOnParentList{
  my($self,$className) = @_;
  return $self->getTable()->isOnParentList($className);
}

########################################
# Methods for dealing with children
# children and objects which have my primary key as a foreign key
########################################

=pod

=head1 getChildren($className,$retrieveIfNoChildren,$getDeletedToo,$where)

Gets children given a className and an optional parameter that will
return all the children of the class regardless if markedDeleted = 1

third argument to be passed in is to retrieve if the children  have  been
marked deleted.

also can pass in an optional hash reference with attribute_name => value
that will be used to constrain the returned children...

=cut


sub getChildren { 
  my($self,$className,$retrieveIfNoChildren,$getDeletedToo,$where,$doNotRetAtts) = @_;
  $className = $self->getTable()->getFullClassName($className);

  if ($self->isOnChildList($className) == 0) {
    die "ERROR: ",$self->getClassName(),"->retrieveChildrenFromDB($className) - Invalid child class\n";
  }

  print STDERR $self->getClassName().":getChildren($className,$retrieveIfNoChildren,$getDeletedToo,$doNotRetAtts)\n" if $debug;

  ##if $retrieveIfNoChildren is true retrieve from db if don't have any children and have not 
  ##retrieved children already..may have none
  ##so don't want to redo query just because there aren't any children to store
  ##NOTE:  This can cause problems..users mar remove a child and then call getChildren($childClass,1) and nothing
  ##comes back as they have already retrieved it onec...for now, always do the query if have not children

  ##only want to return the ones that have not been deleted...need to
  ##not remove the deleted ones from the list as will need to delete
  ##them if do an update!!
  ##important to return undeleted ones first so if they have been given children of
  ##deleted ones the foreignkeys will be set appropriately
  my @tmp;

  if ($retrieveIfNoChildren && !exists $self->{'children'}->{$className} && !$self->{'retrievedChildren'}->{$className}) { 
    ##if it is a super class, check to make certain that don't have any of this subclass first before retrieving
    if ($self->isImpClass($className)) {
      my @check = $self->getSuperClassChildren($className,$retrieveIfNoChildren,$getDeletedToo,$where,$doNotRetAtts);
      if (scalar(@check) > 0) {
        return @check;
      }
    }
    print STDERR $self->getClassName(), "::getChildren - retrieving children from DB\n" if $debug == 1;
    $self->retrieveChildrenFromDB($className,undef,$where,$doNotRetAtts);
  }

  if ($self->isImpClass($className) && !$self->{'retrievingSuperClassChildren'}) {
    print STDERR "retrieving superclass $className children\n" if $debug;
    return $self->getSuperClassChildren($className,$retrieveIfNoChildren,$getDeletedToo,$where,$doNotRetAtts);
  } else {
    my $ch = $self->{'children'}->{$className}; ##temporary copy to facilitate writing sort
    my @sort;
    if ($getDeletedToo) {       ##only sort if getting deleted..
      @sort = sort { $self->getFromPointerCache("$a")->isMarkedDeleted() <=> $self->getFromPointerCache("$b")->isMarkedDeleted() } keys%{$ch};
    } else {
      @sort = keys%{$ch};
    }

    foreach my $c (@sort) {
      #		print STDERR "getChildren:$className\n",$ch->{$c}->toString() if $debug == 1;
      my $hc = $self->getFromPointerCache("$c");
      if ( !$getDeletedToo && $hc->isMarkedDeleted() ) {
        next;
      }

      next if ($where && !$hc->testAttributeValues($where));

      print STDERR "$self: Getting child: ",$hc->getId(), " delete state = '",$hc->isMarkedDeleted(),"'\n" if $debug; # && $ch->{$c}->getClassName() ne 'AssemblySequence';
      push(@tmp,$hc) if $hc;
    }

    return @tmp;
  }
}

sub getSuperClassChildren {
  my($self,$className,$retrieveIfNoChildren,$getDeletedToo,$where) = @_;
  $className = $self->getTable()->getFullClassName($className);
  $self->getDatabase()->getSuperClasses();
  $self->{'retrievingSuperClassChildren'} = 1;
  my @tmp;
  foreach my $pclass ($self->getDatabase()->getSubClasses($className)) {
    print STDERR $self->getClassName().": getting $pclass children for $className\n" if $debug;
    push(@tmp,$self->getChildren($pclass,undef,$getDeletedToo,$where));
  }

  $self->{'retrievingSuperClassChildren'} = 0;
  return @tmp;
}

sub getAllChildren {
  my($self,$retrieve,$getDeletedToo,$where) = @_;
  my @tmp;
  $self->retrieveAllChildrenFromDB() if $retrieve;
  my @cl = $retrieve ? $self->getChildList() : keys%{$self->{'children'}};
  foreach my $class (@cl) {
    next if $self->isImpClass($class);
    my @t = $self->getChildren($class,undef,$getDeletedToo,$where);
    push(@tmp,@t) if @t;
  }
  return @tmp;	 
}

=pod

=head1 getChild('childClassName')

This method returns a single child for those cases where the  relationship
is one to one.  This is not enforced so if there is more than one child, then
only the first one will be returned.

=cut

sub getChild{
  my($self,$className,$retIfNochildren,$getDeletedToo,$where) = @_;
  $className = $self->getTable()->getFullClassName($className);
  my @ch = $self->getChildren($className,$retIfNochildren,$getDeletedToo,$where);
  return $ch[0];
}

=pod

=head1 setChild($child);

Uses the addChild method but first resets to no children.  Use only for
one-to-one relationships as all current children of this class will be removed.

=cut

sub setChild{
  my($self,$c) = @_;

  if (!$c) {
    return undef;
  }

  $self->checkChild($c);

  my $prevP = $c->getParent($self->getClassName());
  if ( $prevP eq $self) {       ##breaks loop!!!am finished
    return 1;
  }
  ##now delete the entry form the childrenDbList and removeChildren in this class...then addChild..
  foreach my $oc ($self->getChildren($c->getClassName(),undef,1)) {
    $self->removeChild($oc);
  }
  delete $self->{'childrenDbList'}->{$c->getClassName()};
  $self->addChild($c);
}


##retrieve methods on children should always retrieve the children from the
##db....if that child already exists....don't revert child with db copy unless
##$reset = 1 then revert all Childs to the db version
## $where is a hash reference with att_name => value for constraining query

sub retrieveChildrenFromDB{
  my($self,$className,$resetIfHave,$where,$doNotRetAtts) = @_;
  
  $className = $self->getTable()->getFullClassName($className);

  if ($self->isOnChildList($className) == 0) {
    die "ERROR: ",$self->getClassName(),"->retrieveChildrenFromDB($className) - Invalid child class\n";
  }

  ##note that need to not retrieve unless $self has a primary key assigned as there are no children in this case.
  if (!$self->getId()) {
    return undef;
  }

  ##set the flag that have retrieved the children of this class
  $self->{'retrievedChildren'}->{$className} = 1;

  print STDERR "GetRelations: className = $className: col1 = ",$self->getChildSelfColumn($className)," col2 = ",$self->getChildColumn($className),"\n" if $debug == 1;

  ##lazy load of the class
  my $evalstmt = "require $className";
  print STDERR "retrieveChildrenFromDB: $evalstmt\n" if $debug;
  eval($evalstmt);

  if ($where && $debug) {
    print STDERR "\nWhere stmt: ";
    foreach my $k (keys%$where) {
      print "$k -> $where->{$k},";
    }
    print "\n";
  }
	
  my $rels;

  ##deal with Imp tables...return appropriate objects!!
  if ($self->isImpClass($className)) { 
    print STDERR $self->getClassName().": $className isImpClass...getting Imp relations\n" if $debug;
    $rels = $self->getImpRelations($className,$self->getChildColumn($className),$self->getChildSelfColumn($className),$where);
    #		print "retrieveChildrenFromDB: about to mark subclasses retrieved.\n";
    ##mark that have retrieved all the subclasses...
    foreach my $c ($self->getSubClasses($className)) {
      $self->{'retrievedChildren'}->{$c} = 1;
    }
  } else {
    $rels = $self->getRelations($className,$self->getChildSelfColumn($className),$self->getChildColumn($className),$className,$where,$doNotRetAtts);
  }
	
  print STDERR "Number of $className children: ".scalar(@$rels)."\n" if $debug;
  foreach my $c (@$rels) {
    print STDERR "Adding Child: ",$c->getClassName(),".",$c->getConcatPrimKey(),"\n" if $debug;
    if (!$resetIfHave) {
      print STDERR "Checking DbCache: ",$c->getClassName(),".",$c->getConcatPrimKey(),"\n" if $debug;
      my $cachedChild = $self->getFromDbCache($c->getClassName(),$c->getConcatPrimKey());
      if ($cachedChild) {       ##have one from cache...
        print "Have this child $cachedChild\n" if $debug;
        $self->addChild($cachedChild);
        next;
      }
    }
			
    print STDERR "retrieveChildrenFromDB\($className\): $c\n",$c->toString(),"\n" if $debug == 1;
		
    if (!$c->checkReadPermission()) {
      print STDERR "Insufficient permission to retrieve $className Child of ".$self->getClassName()."\n".$c->toString();
      next;
    }
    $self->addToDbCache($c,$resetIfHave);
    $self->addChild($c,$resetIfHave);
  }
}

##make minimal first then more robust (catch missing atts) later if need be..
sub getImpRelations {
  my($self,$className,$relCol,$myCol,$where) = @_;

  $className = $self->getTable()->getFullClassName($className);

  print STDERR "getImpRelations($self,$className,$myCol,$relCol,$where)\n" if $debug;
  $where->{$relCol} = $self->get($myCol);
  my $table = $className =~ /Imp$/ ? $className : $className . "Imp";
  $className =~ s/Imp$//;       ##strip Imp if there..
  my $dbh = $self->getQueryHandle();
  #	 my $dbh = $self->getMetaHandle();
  my $sql = "select * from ".$self->getDatabase()->getTable($table)->getOracleTableName()." ". $self->getDatabase()->getTable($table)->makeWhereHavingClause($where);
  print STDERR "getImpRelations: $sql\n" if $debug || $self->getDatabase()->getVerbose();
  my $stmt = $dbh->prepareAndExecute($sql);
  my @objects;
  while (my $row = $stmt->fetchrow_hashref('NAME_lc')) { 
    push(@objects,$self->getDatabase()->getTable($table)->buildObjectsFromImpTable($row));
  }
  return \@objects;
}


sub isImpClass {
  my($self,$className) = @_;
  $className = $self->getTable()->getFullClassName($className);
  if ($className =~ /Imp$/) {
    return 1;
  }
  return 0; 
}

sub isSuperClass {
  my($self,$className) = @_;
  $className = $self->getTable()->getFullClassName($className);
  return $self->getDatabase()->isSuperClass($className)
}

sub getSuperClasses {
  my $self = shift;
  return $self->getDatabase()->getSuperClasses();
}

sub getSubClasses {
  my($self,$superClass) = @_;
  $superClass =~ s/Imp$//;
  return $self->getDatabase()->getSubClasses($superClass);
}

sub resetChildrenToDB{
  my($self,$className,$where) = @_;
  $className = $self->getTable()->getFullClassName($className);
  $self->removeChildrenInClass($className);
  $self->retrieveChildrenFromDB($className,undef,$where);
}

##note that if recursive then will retrieve all the children for this object and all their
##children.......
sub retrieveAllChildrenFromDB{
  my($self,$recursive,$resetIfHave) = @_;
  ##NOTE:  don't want to retrieve super and all subclasses..
  my %supers;                   ##superclasses
  my %subs;                     ##subclasses
  foreach my $className ($self->getChildList()) {
    $supers{$className} = 1 if $self->isImpClass($className);
  }
  foreach my $super (keys%supers) {
    #		print STDERR "Getting superclass children for $super\n";
    foreach my $s ($self->getSubClasses($super)) {
      $subs{$s} = 1;
    }
    $self->retrieveChildrenFromDB($super,$resetIfHave);
  }
  foreach my $className ($self->getChildList()) {
    next if $self->isImpClass($className) || $self->isSuperClass($className) || $subs{$className}; ##have already done these!!
#    next if $self->isImpClass($className) || $self->isSuperClass($className);  ##|| exists $subs{$className}; ##have already done these!!
    $self->retrieveChildrenFromDB($className,$resetIfHave);
  }
  if ($recursive) {
    foreach my $c ($self->getAllChildren(undef,1)) {
      $c->retrieveAllChildrenFromDB($recursive,$resetIfHave);
    }
  }
}

sub resetAllChildrenToDB{
  my $self = shift;
  $self->removeAllChildren();
  $self->retrieveAllChildrenFromDB();
}

=pod

=head1 addChild($child,$resetIfHave)

This method takes in a child, tests to see if it is valid, if child has a different parent
it removes itself from that parent.  Then checks to see if it is already on list from the database
and if it is the old child is removed if $resetIfHave = 1 and the new child is added as a child and the new childs 
parent is set to $self.  If the child does not have
a valid id it is not tracked and is added to list.  

=cut

sub addChild {
  my($self,$c,$resetIfHave) = @_;

  $self->checkChild($c);

  ##following breaks loop!!
  if (exists $self->{'children'}->{$c->getClassName()}->{$c}) {
    #		print STDERR "*****breaking addChild loop*****\n";
    return;
  }

  ##in the instance where the pointer cache has been undef'ed and the user still has
  ##an object in scope such as an AlgorithmInvocation that object should be put back on
  ##the pointer cache if it is being assigned as a parent or child...
  if (! $self->getFromPointerCache("$self")) {
    $self->undefAllRelations(); ##need to remove all relations as can reuse object refs...
    $self->addToPointerCache($self);
  }

  print STDERR $self->getClassName()."->AddChild: ",$c->getClassName()," - ",$c->getConcatPrimKey(),"\n" if $debug == 1;

  my $prevP = $c->getParent($self->getClassName());
  ##want to check to see if child has a current parent if so remove from that parent
  if (defined $prevP) {
    ##have an old parent....remove pointer...
    print STDERR "addChild: removing old parent\n" if $debug == 1;
    $prevP->removeChild($c);
  }

  if (defined (my $pk = $c->getConcatPrimKey())) { ##has valid primary key...
    print STDERR "addChild:FromDB: $pk\n" if $debug == 1;
    if (exists $self->{'childrenDbList'}->{$c->getClassName()}->{$pk}) {
      if (!$resetIfHave) {
        return;
      }                         ##don't reset the child unless resetIfHave  is true
      ##need to remove from child array and replace with the new one...
      print STDERR "addChild:FromDB:OldChild: $pk\n" if $debug == 1;
      $self->removeChild($self->getFromPointerCache($self->{'childrenDbList'}->{$c->getClassName()}->{$pk}));
    }
    $self->{'childrenDbList'}->{$c->getClassName()}->{$pk} = "$c"; ##add to hash to track unique db objs
  } else {
    print STDERR "addChild:", $c->getClassName()," - Not From DB\n" if $debug == 1;
  }
  $self->{'children'}->{$c->getClassName()}->{$c} = 1; ##the children are the keys of the hash!!

	
  ##call setParent on child .... 
  $c->setParent($self);  
}

sub addChildren{
  my $self = shift;
  foreach my $c (@_) {
    print "AddChildren: adding child\n" . $c->toString() if $debug == 1;
    $self->addChild($c);
  }
}

sub markChildDeleted{
  my($self,$c) = @_;
  $c->markDeleted();
}

sub markChildrenInClassDeleted{
  my($self,$className) = @_;
  $className = $self->getTable()->getFullClassName($className);
  foreach my $c ($self->getChildren($className)) {
    $c->markDeleted();
  }
}

sub markChildrenDeleted{
  my($self,@ch) = @_;
  foreach my $c (@ch) {
    $c->markDeleted();
  }
}

sub markAllChildrenDeleted{
  my($self,$recursive) = shift;
  foreach my $className ($self->getChildList()) {
    foreach my $c ($self->getChildren($className)) {
      $c->markDeleted();
      if ($recursive) {
        $c->markAllChildrenDeleted($recursive);
      }
    }
  }
}

sub markChildUnDeleted{
  my($self,$c) = @_;
  $c->markUndeleted();
}

sub markChildrenInClassUnDeleted{
  my($self,$className) = @_;
  foreach my $c ($self->getChildren($className,undef,1)) {
    $c->markUnDeleted($c);
  }	 
}

sub markChildrenUnDeleted{
  my($self,@ch) = @_;
  foreach my $c (@ch) {
    $c->markUnDeleted($c);
  }	 
}

sub markAllChildrenUnDeleted{
  my($self) = shift;
  foreach my $className ($self->getChildList()) {
    $self->markChildrenUnDeleted($className);
  }
}

##in this case...remove entirely from array....
##presumably here the child will just disappear and be garbage collected
##if want to assign to another Template then call the addChild() method in
##that template and it will remove itself from this one...
## NOTE:  this does not remove from the pointers cache..
sub removeChild{
  my($self,$c) = @_;

  print STDERR "removeChild: $c\n" if $debug == 1;

  if (!exists $self->{'children'}->{$c->getClassName()}->{$c}) { ##don't have this child so return
    return;
  }
  ##remove from hash that is tracking....
  if ($c->getConcatPrimKey()) {
    delete $self->{'childrenDbList'}->{$c->getClassName()}->{$c->getConcatPrimKey()};
  }

  delete $self->{'children'}->{$c->getClassName()}->{$c};

  ##want to remove the childs pointer back to me...
  $c->removeParent($self);
  
}

sub removeChildren{
  my($self,@ch) = @_;
  foreach my $c (@ch) {
    $self->removeChild($c);
  }
}

sub removeChildrenInClass{
  my ($self,$className) = @_;
  $className = $self->getTable()->getFullClassName($className);
  undef $self->{'children'}->{$className};
  undef $self->{'childrenDbList'}->{$className};
  undef $self->{'retrievedChildren'}->{$className};
}

sub removeAllChildren{
  my $self = shift;
  $self->undefAllChildren();
}

sub undefAllChildren {
  my $self = shift;
  undef $self->{'children'};
  undef $self->{'childrenDbList'};
  undef $self->{'retrievedChildren'};
}

sub undefAllRelations {
  my $self = shift;
  $self->undefAllChildren();
  $self->undefAllParents();
}	

##gets the primaryKey attributes and concatenates them
sub getConcatPrimKey{
  my $self = shift;
  #	print STDERR "Concatenating primary keys\n";
  my $keys = $self->getPrimaryKey();
  my $tmp = "";
  foreach my $k (keys%{$keys}) {
    $tmp .= $keys->{$k};
  }
  if (length($tmp) == 0) {
    return undef;
  }
  return $tmp;
}

##determines if any primarykey atts are null...returns 0 if there are
sub haveAllPrimaryKeyValues {
  my $self = shift;
  my $keys = $self->getPrimaryKey();
  foreach my $k (keys%{$keys}) {
    return 0 unless(defined $keys->{$k} && $keys->{$k} !~ /null/i);
  }
  return 1;
}


########################################
# Parents....
# Defining parents as things for which I have a foreign key
# There can thus be only 1 parent
########################################

##also call set child in parent;
sub setParent{
  my($self,$p) = @_;

  if (!$p) {
    return undef;
  }

  $self->checkParent($p);

  print STDERR "Setting parent for $self:",$self->getId(),", Parent: $p:",$p->getId(),"\n" if $debug == 1;

  ##in the instance where the pointer cache has been undef'ed and the user still has
  ##an object in scope such as an AlgorithmInvocation that object should be put back on
  ##the pointer cache if it is being assigned as a parent or child...
  if (! $self->getFromPointerCache("$self")) {
    $self->undefAllRelations();
    $self->addToPointerCache($self);
  }

  my $prevP= $self->getParent($p->getClassName());
  if ($prevP eq $p) {		##then is same parent already have and am finished...
    return 1;
  } elsif (defined $prevP) {
    print STDERR "removing self from previous parent: ",$prevP->getClassName()," - ",$prevP->getId(),"\n" if $debug == 1;
    $prevP->removeChild($self);
  }

  ##set the parent......
  $self->{'parents'}->{$p->getClassName()} = "$p";

  ##set pointer in parent to self 
  print STDERR "setParent: setting childs pointer to self\n" if $debug == 1;
  $p->addChild($self); 

  return 1;
}


##get method will retrieve parent if have not retrieved parent yet
sub getParent {
  my($self,$className,$retrieveIfNoParent,$doNotRetAtts) = @_;
  ##retrieve from db if don't have any parents and have not retrieved parents already..
  $className = $self->getTable()->getFullClassName($className);

  if (!$self->isOnParentList($className)) {
    die "Error: trying to get invalid parent $className from $self->getClassName";
  }

  print STDERR $self->getClassName()."->getparent($className,$retrieveIfNoParent)\n" if $debug;
  if (!exists $self->{'parents'}->{$className} && $retrieveIfNoParent && !$self->{'retrievedParents'}->{$className}) { ## && !exists $self->{'parentRet'}->{$className}){
    if ($self->isImpClass($className)) {
      my $tmpP = $self->getSuperClassParent($className,$doNotRetAtts);
      return $tmpP if $tmpP;
    }
    $self->retrieveParentFromDB($className,$doNotRetAtts);
  }
  if ($self->isImpClass($className) && !$self->{'retrievingSuperClassParent'}) {
    return $self->getSuperClassParent($className);
  } else {
    return $self->getFromPointerCache("$self->{'parents'}->{$className}");
  }
}

sub getSuperClassParent {
  my($self,$className,$retrieveIfNoParent,$doNotRetAtts) = @_;
  $className = $self->getTable()->getFullClassName($className);
  $self->getDatabase()->getSuperClasses();
  $self->{'retrievingSuperClassParent'} = 1;
  my $p;
  if (exists $self->{'superClassParent'}->{$className}) {
    $self->{'retrievingSuperClassParent'} = 0;
    return $self->getParent($self->{'superClassParent'}->{$className},undef,$doNotRetAtts);
  }
  foreach my $pclass ($self->getDatabase()->getSubClasses($className)) {
    $p = $self->getParent($pclass,undef,$doNotRetAtts);
    if ($p) {
      $self->{'superClassParent'}->{$className} = $p->getClassName();
      last;
    }
  }
  $self->{'retrievingSuperClassParent'} = 0;
  return $p;
}

sub getAllParents{
  my($self,$retrieve,$doNotRetAtts) = @_;
  my @tmp;
  $self->retrieveAllParentsFromDB() if $retrieve;
  #	print STDERR $self->getClassName()."->getAllParents($retrieve)\n";
  my @pl = $retrieve ? $self->getParentList() : keys%{$self->{'parents'}};
  foreach my $cn (@pl) {
    push(@tmp,$self->getParent($cn)) if $self->getParent($cn,$doNotRetAtts);
  }
  return @tmp;
}


sub retrieveParentFromDB{
  my($self,$className,$doNotRetAtts) = @_;
  $className = $self->getTable()->getFullClassName($className);
  print STDERR "retrieving $className parent\n" if $debug;
  if ($self->isOnParentList($className)) {
    $self->{'retrievedParents'}->{$className} = 1;
    ##not retrieve if don't have the fk for parent..
    if (!defined $self->get($self->getParentSelfColumn($className))) {
      print STDERR "ERROR: foreign key to parent \(",$self->getParentSelfColumn($className),"\) not set: \n",$self->toString() if $debug;
      return undef;
    }
		
    my $list;

    my $cachedParent = $self->getFromDbCache($className,$self->get($self->getParentSelfColumn($className)));
    if ($cachedParent) {        ##have one from cache...
      print "Have this parent $cachedParent\n" if $debug;
      $self->setParent($cachedParent);
      return 1;
    }
	
    ##deal with Imp tables...return appropriate objects!!
    if ($self->isImpClass($className)) { 
      print STDERR $self->getClassName().": $className isImpClass...getting Imp relations\n" if $debug;
      $list = $self->getImpRelations($className,$self->getParentColumn($className),$self->getParentSelfColumn($className).$doNotRetAtts);
      ##may already have this one.....check cache...
      if ($list) {
        my $cp = $self->getFromDbCache($list->[0]->getClassName(),$list->[0]->getConcatPrimKey());
        if ($cp) {
          $self->setParent($cp);
          return 1;
        }
      }
    } else {
      eval("require $className");
      $list = $self->getRelations($className,$self->getParentSelfColumn($className),$self->getParentColumn($className),$className,undef,$doNotRetAtts);
    }
    if (!$list->[0]->checkReadPermission()) {
      print STDERR "Insufficient permission to retrieve $className parent for ".$self.getClassName()."\n";
      return undef;
    }
    $self->addToDbCache($list->[0]);
    $self->setParent($list->[0]);
    return 1;
    ##set the flag that have retrieved the parent of this class
  } else {
    die "ERROR: ",$self->getClassName(),"::retrieveParentFromDB - Invalid Parent Class: $className\n";
  }
}

sub retrieveAllParentsFromDB{
  my $self = shift;
  my %supers;                   ##superclasses
  my %subs;                     ##subclasses
  foreach my $cn ($self->getParentList()) {
    $supers{$cn} = 1 if $self->isImpClass($cn);
  }
  foreach my $super (keys%supers) {
    #		print STDERR "Getting superclass parent for $super\n";
    foreach my $s ($self->getSubClasses($super)) {
      $subs{$s} = 1;
    }
    $self->retrieveParentFromDB($super);
  }
  foreach my $cn ($self->getParentList()) {
    next if $self->isImpClass($cn) || exists $subs{$cn}; ##have already done these!!
    $self->retrieveParentFromDB($cn);
  }
}


##method that sets my foreign key for parent to parents PK.
##NOTE: I could have the parent submit self but not recursively if it does not have ID...this seems
##reasonable to me....Not implemented at this time...
sub setParentId{
  my($self,$p) = @_;
  if ( ! $p->getId()) {
    print STDERR "ERROR: ",$self->getClassName(),"::setParentId - Parent does not have a primary key\n",$p->toString();
    return 0;
    ##parent has not been submitted..do non-recursive submit.....don't do for now programmer must do this explicitly
    #$p->submit(1);
  }
  
  ###Mark should be able to help here using something from sybextent
  ##otherwise could use className and append Id to get the id if that is standard
  my $cmd = "set" . $p->getClassName() . "Id";
  $self->$cmd($p->getId());
  return 1;
}


##following is for removing a parent no longer want...
##Does it by calling removeChild($self) on the parent to remove myself from the parent as its child...
##it is the responsibility of the parent to remove its pointer to me and also my pointer to it directly
##to avoid looping...
sub removeParent{
  my($self,$p) = @_;
  ##if I don't have this parent then am finished....breaks remove loop..
  if (exists $self->{'parents'}->{$p->getClassName()}) {
    delete $self->{'parents'}->{$p->getClassName()};
    delete $self->{'retrievedParents'}->{$p->getClassName()};
    $p->removeChild($self);     ##remove childs pointer to self...
  }
}

sub removeAllParents{
  my $self = shift;
  foreach my $p ($self->getAllParents()) {
    $self->removeParent($p); 
  }
}

sub undefAllParents {
  my $self = shift;
  undef $self->{'parents'};
  undef $self->{'retrievedParents'};
}

########################################
# EVIDENCE
########################################

=pod

=head1 Evidence

Need specific methods to deal with evidence tables.  Although can treat as children, can
not use getRelations (or can we??) so need to have another set of methods for dealing with
this.

=cut

##store like the children and parents

############################################################
# Evidence:  how to store....
# We need to relate things together by an evidence_group_id
# minimally should be $self->{'evidence'}->{'factTableName'} with an array of objects.
# should this be rather than an array a hash with evidence_group_id as key...?
############################################################


sub retrieveEvidenceFromDB {
  my($self,$factTableName,$resetIfHave) = @_;

  $factTableName = $self->getFullTableClassName($factTableName);

  return undef unless $self->hasSinglePrimaryKey(); ##must have a single key primary key
  my $dbcmd = "select e.* from Dots.Evidence e where e.target_table_id = ".$self->getTable()->getTableId().
    " and e.target_id = ".$self->getId()." and e.fact_table_id = ".$self->getDatabase()->getTable($factTableName)->getTableId();
  print STDERR "retrieveEvidenceFromDB:: sql = '$dbcmd'\n" if $debug;
  $self->fetchEvidence($dbcmd,$resetIfHave);
}
  
##queries the Evidence table and stores all evidence...
sub retrieveAllEvidenceFromDB {
  my($self,$resetIfHave,$targetOrFact) = @_;
  return undef unless $self->hasSinglePrimaryKey(); ##must have a single key primary key
  my $table_id = $self->getTable()->getTableId();
  my $cmd = "select * from Dots.Evidence where (target_table_id = $table_id and target_id = ".$self->getId().")";
  $cmd .= " or (fact_table_id = $table_id and fact_id = ".$self->getId().")" if $targetOrFact;
  print STDERR "\n$cmd\n" if $debug;
  $self->fetchEvidence($cmd,$resetIfHave);
}

sub fetchEvidence {
  my($self,$sql,$resetIfHave) = @_;
  my $sth = $self->getDbHandle()->prepareAndExecute($sql);
  my @tmp;
  while (my $evidence = $sth->fetchrow_hashref('NAME_lc')) {
    push(@tmp,$evidence);
  }
  foreach my $evidence (@tmp){
    my $cacheEv = $self->getFromDbCache('Evidence',$evidence->{evidence_id});
    my $ev =  ($cacheEv && !$resetIfHave) ? $cacheEv : GUS::Model::DoTS::Evidence->new($evidence,$self->getDatabase());
    if ($ev->checkReadPermission()) {
      print STDERR "Storing Evidence: \n".$ev->toXML(2,1) if $debug;
      $self->removeEvidence($cacheEv) if ($resetIfHave && $cacheEv);
      $self->{'evidence'}->{$self->getTableNameFromTableId($ev->get('fact_table_id'))}->{"$ev"} = 1;
      $self->addToDbCache($ev,$resetIfHave);
    }
  }
}

##get evidence of a specific type...(fact table)
##returns array of Evidence objs...get fact by calling Evidence->getEvidenceFact(1) on each...

sub getEvidence{
  my($self,$factTableName,$retrieveUnlessHave) = @_;
  my @tmp;
  if (!exists $self->{'evidence'}->{$factTableName} && $retrieveUnlessHave) {
    $self->retrieveEvidenceFromDB($factTableName);
  }
  foreach my $ev (keys %{$self->{'evidence'}->{$factTableName}}) {
    push(@tmp,$self->getFromPointerCache("$ev"));
  }
  return @tmp;
}

##this does not do any retrievals...just returns what have!!
sub getAllEvidence{
  my($self)= shift;
  my @tmp;
  foreach my $tableName (keys %{$self->{'evidence'}}) {
    push(@tmp,$self->getEvidence($tableName));
  }
  return @tmp;
}

sub addEvidence{
  my($self,$fact,$egid,$attribute_name,$best_evidence) = @_;
  my $evidence_group_id = $egid ? $egid : 1;
  my $ev = GUS::Model::DoTS::Evidence->new({'target_table_id' => $self->getTable()->getTableId(),
                        'fact_table_id' => $self->getDatabase()->getTable($fact->getClassName())->getTableId(),
                        'evidence_group_id' => $evidence_group_id},$self->getDatabase());
  $ev->setAttributeName($attribute_name) if $attribute_name;
  $ev->setBestEvidence(1) if $best_evidence;
  $ev->addEvidenceFact($fact);
  $self->{'evidence'}->{$fact->getClassName()}->{"$ev"} = 1;
}

sub removeEvidence {
  my($self,$ev) = @_;
  delete $self->{'evidence'}->{$self->getTableNameFromTableId($ev->get('fact_table_id'))}->{"$ev"};
}

## this should submit facts if they have not been submitted (never update them...!)
## and then set the ids and tables....
sub submitEvidence {
  my($self,$e,$notDeep,$noTran) = @_;
  ##first submit the fact if it does not have a pk
  my $fact = $e->getEvidenceFact();
  if ($fact) {
    if (!$fact->getId()) {
      $fact->submit($notDeep,$noTran);
    }
    ##now need to set the ids
    $e->set('target_id',$self->getId());
    $e->set('fact_id',$e->getEvidenceFact()->getId());
    ##and submit...
  } elsif (!$e->isMarkedDeleted()) { ##there is no fact here...
    print STDERR "There is no fact associated with the Evidence object\n";
    return;
  }
  $e->submit($notDeep,$noTran);
  $self->removeEvidence($e) if $e->isMarkedDeleted();
}

sub submitAllEvidence {
  my($self,$notDeep,$noTran) = @_;
  foreach my $e ($self->getAllEvidence()) {
    $self->submitEvidence($e,$notDeep,$noTran);
  }
}

##following for deleting evidence rows when deleting the entry...called by submit on objects markedDeleted
##note that this does not delete the fact rows....the application program is responsible for this!!
sub deleteAllEvidence {
  my($self,$notDeep,$noTran) = @_;
  print STDERR "\nDeleting All Evidence for ".$self->getClassName().":".$self->getId()."\n" if $debug;
  $self->retrieveAllEvidenceFromDB(undef,1);
  foreach my $ev ($self->getAllEvidence()) {
    print STDERR "\n  Deleting evidence: ".$ev->getId()."\n" if $debug;
    $ev->markDeleted();
    $ev->submit($notDeep,$noTran); ##inside transaction....don't start another.
    $self->removeEvidence($ev);
  }
}

##methods for dealing with fact tables...
##NOTE:  these have not been tested and likely don't work approptiately!!
##there are specific methods currently for Similarity facts...

##note that this does not retrieve right now....
sub getFacts {
  my($self,$factTableName) = @_;
  my @tmp;
  foreach my $f (@{$self->{'fact'}->{$factTableName}}) {
    push(@tmp,$self->getFromPointerCache("$f"));
  }
  return @tmp;
}

sub getAllFacts {
  my $self = shift;
  my @tmp;
  foreach my $key (keys %{$self->{'fact'}}) {
    push(@tmp,$self->getFacts($key));
  }
  return @tmp;
}

sub addFact {
  my($self,$fact) = @_;
  push(@{$self->{'fact'}->{$fact->getClassName()}},"$fact");
}

sub submitFact {
  my($self,$fact,$notDeep,$noTran) = @_;
  $fact->submit($notDeep,$noTran);
}

sub submitAllFacts {
  my($self,$notDeep,$noTran) = @_;
  foreach my $f ($self->getAllFacts()) {
    $f->submit($notDeep,$noTran);
  }
}

############################################################
# methods for dealing with Similarity facts specifically
# this is special case because essentially stores a relationship
# between any two sequence objects in the db.....
############################################################
sub getSimilarityFacts {
  my($self,$getIfDontHave) = @_;
  if (!exists $self->{'simFacts'} && $getIfDontHave) {
    $self->retrieveSimilarityFactsFromDB();
  }
  my @tmp;
  foreach my $f (keys %{$self->{'simFacts'}}) {
    push(@tmp,$self->getFromPointerCache("$f"));
  }
  return @tmp;
}

##note that this should get regardless of whether is query or subject...
sub retrieveSimilarityFactsFromDB {
  my($self,$subjectTableName,$getEitherWay,$resetIfHave,$summaryOnly) = @_;
  #	my $simE = $self->getQueryHandle(); 
  my $simE = $self->getMetaHandle(); 
  my $table_id = $self->getTable()->getTableId();
  my $query = $getEitherWay ? "select * from Dots.Similarity where \(".
    " subject_table_id = $table_id and subject_id = ".$self->getId()."\) ".
      " OR (query_table_id = $table_id and query_id = ".$self->getId()."\)" : 
        " select * from Dots.Similarity where query_table_id = $table_id and query_id = ".$self->getId();
  if ($subjectTableName) {      ##restrict to particular subject tablename
    $subjectTableName = $self->getFullTableClassName($subjectTableName);
    my $subject_table_id = $self->getDatabase()->getTable($subjectTableName)->getTableId();
    if ($subject_table_id) {
      $query .= " and subject_table_id = $subject_table_id";
    } else {
      print STDERR "retrieveSimilarityFactsFromDB: Subject table $subjectTableName not a valid table name\n";
    }
  }
  my $sth = $simE->prepareAndExecute($query);
  my @tmp;
  while (my $row = $sth->fetchrow_hashref('NAME_lc')) {
    ##need to get children here....
    push(@tmp,GUS::Model::DoTS::Similarity->new($row,$self->getDatabase()));
  }
  foreach my $f (@tmp) {
    $f->retrieveChildrenFromDB('SimilaritySpan') unless $summaryOnly;  
    $self->addSimilarityFact($f,$resetIfHave);
  }
}

sub addSimilarityFact {
  my($self,$fact,$resetIfHave) = @_;
  if ($fact->getId()) {
    ##from the db so need to track!!
    if (exists $self->{'simFactsFromDB'}->{$fact->getId()}) {
      if ($resetIfHave) {       ##reset to the db version
        delete $self->{'simFacts'}->{$self->{'simFactsFromDB'}->{$fact->getId()}};
      } else {
        return;
      }
    }
  }
  $self->{'simFacts'}->{"$fact"} = 1;
  $self->{'simFactsFromDB'}->{$fact->getId()} = "$fact" if $fact->getId();
}

##following delete....call remove...
sub removeSimilarityFact {
  my($self,$fact) = @_;
  delete $self->{'simFacts'}->{"$fact"};
  delete $self->{'simFactsFromDB'}->{$fact->getId()};
}

##note that this always submits deep as has SimilaritySpan and Summary children
sub submitSimilarityFact {
  my($self,$fact,$notDeep,$noTran) = @_;
  $fact->submit(undef,$noTran);
  $self->removeSimilarityFact($fact) if $fact->isMarkedDeleted();
}

sub submitAllSimilarityFacts {
  my($self,$notDeep,$noTran) = @_;
  foreach my $f ($self->getSimilarityFacts()) {
    $self->submitSimilarityFact($f,undef,$noTran);
  }
}

##the following methods are for when an entry gets deleted...will go to db to get entries
##mark them deleted and then submit....
sub deleteSimilarityFact {
  my($self,$f,$noTran) = @_;
  print STDERR "\nDeleting SimilarityFact:".$f->getId()."\n" if $debug;
  $f->retrieveAllChildrenFromDB(1); ##note this is recursive!!
  $f->markDeleted(1);
  $f->submit(undef,$noTran);
  $self->removeSimilarityFact($f);
}

sub deleteAllSimilarityFacts {
  my($self,$noTran) = @_;
  print STDERR "\nDeleting All SimilarityFacts for ".$self->getClassName().":".$self->getId()."\n" if $debug;
  $self->retrieveSimilarityFactsFromDB(undef,1,undef,1);
  foreach my $f ($self->getSimilarityFacts()) {
    $self->deleteSimilarityFact($f,$noTran);
  }
}

sub deleteOrRepointAllSimilarityFacts {
  my($self,$noTran) = @_;
  print STDERR "\nDeleting or repointing All SimilarityFacts for ".$self->getClassName().":".$self->getId()."\n" if $debug;
  my $table_id  = $self->getTable()->getTableId();
  my $version_table_id  = $self->getDatabase()->getTable($self->getSchemaName()."Ver::".$self->getTableName().'Ver')->getTableId();
  $self->retrieveSimilarityFactsFromDB(undef,1,undef,1);
  foreach my $f ($self->getSimilarityFacts()) {
    if($f->getSubjectTableId() == $table_id){
      $f->setSubjectTableId($version_table_id);
      $f->submit(undef,$noTran);
#      $self->removeSimilarityFact($f);
    }else{
      $self->deleteSimilarityFact($f,$noTran);
    }
  }
}

sub getTableNameFromTableId {
  my($self,$table_id) = @_;
  return $self->getDatabase()->getTableNameFromTableId($table_id);
}

sub getTableIdFromTableName {
  my($self,$className) = @_;
  return $self->getDatabase()->getTable($className)->getTableId();
}

sub getTablePKFromTableId {
  my($self,$table_id) = @_;
  my $tn = $self->getDatabase()->getTableNameFromTableId($table_id);
  return $self->getDatabase()->getTable($tn)->getPrimaryKey();
}

##NOTE:  This is dependent specifically on the table_id of the Imp sequence tables!!
sub hasSequence {
  my $self = shift;
  return $self->getTable()->hasSequence(); ##will be undef if not onlist..
}


########################################
# methods for tracking things
# and managing object...
########################################

sub isMarkedDeleted {
  my $self = shift;
  return $self->{'markDeleted'} ? $self->{'markDeleted'} : 0;
}

sub allNonNullsSet {
  my($self) = @_;

  my $table;
  ## Check for Postgres Views, that don't properly have their nullability set
  if ( $self->getDatabase()->getDSN() =~ /pg/i && $self->isValidAttribute('subclass_view') ) {
      $table = $self->getDatabase()->getTable($self->getTable()->getRealTableName());
  } else {
      $table  = $self->getTable();  
  }

  foreach my $a (@{$table->getAttributeInfo()}) {
    ##	print STDERR $self->getClassName(),"::allNonNullsSet: $a->{'col'}, nullable = $a->{'Nulls'}, value=",$self->get("$a->{'col'}"),"\n";
    if ($a->{'Nulls'} == 0 && (!defined $self->get("$a->{'col'}") || $self->get("$a->{'col'}") =~ /null/i)) {
      print STDERR "allNonNullsSet: $a->{'col'} not set... = '".$self->get("$a->{'col'}")."'\n" if $debug;
      return 0;
    }
  }
  return 1;
}

##will get deleted upon submission
##if $doChildren then will mark all children deleted that currently has
##won't retrieve children from DB.
sub markDeleted{
  my($self,$doChildren) = @_;
  print STDERR "\nWARNING: MARKING $self DELETED\n\n" if $debug;
  if ($doChildren) {
    foreach my $c ($self->getAllChildren(undef,1)) {
      $c->markDeleted(1);
    }
  }
  $self->{'markDeleted'} = 1;
}

sub markUnDeleted {
  my $self = shift;
  $self->{'markDeleted'} = 0;
}

########################################
# Submitting...
########################################

sub getTotalUpdates {
  my($self) = @_;
  return $self->getDatabase()->getTotalUpdates();
}
sub getTotalInserts {
  my($self) = @_;
  return $self->getDatabase()->getTotalInserts();
}
sub getTotalDeletes {
  my($self) = @_;
  return $self->getDatabase()->getTotalDeletes();
}

sub submit {
  my($self,$notDeep,$noTran) = @_;

  my $return = 1;               ##return value.....will set to 0 if anything barfs....

  print STDERR "Submitting ",$self->getClassName(),":\n ",$self->toString(),"\nHasChangedAttributes='",$self->hasChangedAttributes()."'\n" if $debug == 1;

  ##begin transaction....
  $self->getDatabase()->manageTransaction($noTran,'begin');
  
  ##if marked for deletion don't need to set any keys etc
  ##can do the delete regardless of nonNulls being set
  if ($self->isMarkedDeleted()) {
    print STDERR $self->getClassName(),"::submit - is Marked Deleted\n" if $debug == 1;
    ##need to do delete here...delete all children with pk as foreign key
    ##means that will need method to do this recursively...
    ##should  hardcode the evidence things as can't get from DB.
    
    ###should remove self as pointer from any parents that have me....
    $self->removeAllParents();  ##the parents will then remove me from their children
    $self->submitAllChildren() unless $notDeep; ##note that if the children have non-nullable foreign keys then this will barf if notDeep
    
    # if I have an ID (meaning I am from db) then proceed else am finished...
    if ($self->allNonNullsSet() && $self->isUpdateable() && $self->checkWritePermission()) {  	 
      ##version self
      $self->version();         ##should distinguish things that can version vs those that can't
      $self->getDatabase()->incrementTotalDeletes();
      ##need to also delete all evidence for this entry!!
      $self->deleteAllEvidence(undef,1) if ($self->{deleteEvidence} && $self->getDatabase()->getGlobalDeleteEvidenceOnDelete());
      ##SimilarityFacts
      $self->deleteOrRepointAllSimilarityFacts(1) if ($self->hasSequence() && $self->getDatabase()->getGlobalDeleteSimilarityOnDelete() && $self->{deleteSimilarity}); ##want to also delete the Spans

      ##submitList of other things to be submitted on submit..
      $self->submitSubmitList();

      ##delete from db...
      $self->removeFromDB();
      ##submit if in transaction...
      return $self->getDatabase()->manageTransaction($noTran,'commit');
    }
  } else {
		
    ##first need to set my foreign keys for parent objects....
    #if any parent objs don't have foreign keys then return 0
    #NOTE: could submit parent notDeep if it doesn't have a foreign key and continue 
    print STDERR "Setting all foreign keys\n" if $debug == 1;
    if (! $self->setAllForeignKeys()) { 
      print STDERR "ERROR: ".$self->getClassName()."->submit()...not all foreign keys set\n" if $debug;
      return 0; 
    }
		
    print STDERR $self->getClassName()."->Submit: All foreign keys are set...proceeding\n" if $debug;


    ## If all the nonNulls are set, then this is an update.
    if ( $self->allNonNullsSet() ) { 
      ##UPDATE			##from database so need to update
      print STDERR "Updating $self\n" if $debug;
      if ($self->isUpdateable() && $self->checkWritePermission()) {
        if ($self->hasChangedAttributes()) {
          $self->set('modification_date',$self->getDatabase()->getDateFunction()); 
          $self->set('row_alg_invocation_id',$self->getDatabase()->getDefaultAlgoInvoId()) if (defined $self->getDatabase()->getDefaultAlgoInvoId());
          $self->set('row_user_id',$self->getDatabase()->getDefaultUserId()) if (defined $self->getDatabase()->getDefaultUserId() && $self->getRowUserId() != $self->getDatabase()->getDefaultUserId());
          print STDERR "Am updateable and have changed atts\n".$self->toString() if $debug;
          $self->version();
          $self->update();
          $self->getDatabase()->incrementTotalUpdates();
        }
      }

    } else {                    ##INSERT
      ## set the subclass_view if it is a valid att and not set
      $self->set('subclass_view',$self->getTableName()) if($self->isValidAttribute('subclass_view') && !$self->getSubclassView());
      ##    do insert and call submit on all children
      $self->setDefaultAttributes();
      print STDERR "Inserting:\n", $self->toString() if $debug == 1;
      $self->insert() if $self->isUpdateable();
      $self->getDatabase()->incrementTotalInserts();
    }
    ##NOTE: currently am submitting all evidence and facts regardless of whether $notDeep!!
    $self->submitAllEvidence(undef,1);
    $self->submitAllFacts(undef,1);
    $self->submitAllSimilarityFacts(undef,1);
    $self->submitAllChildren() unless $notDeep; 
    ##submitList of other things to be submitted on submit..
    $self->submitSubmitList();
  }	
  ##submit if in transaction...
  return $self->getDatabase()->manageTransaction($noTran,'commit');
}

sub setDefaultAttributes {
  my $self = shift;
  $self->set('modification_date',$self->getDatabase()->getDateFunction()); # if $self->isValidAttribute('modification_date');
  $self->set('row_project_id',$self->getDatabase->getDefaultProjectId()) if (defined $self->getDatabase->getDefaultProjectId() && !$self->get('row_project_id')); # && $self->isValidAttribute('project_id'));
  $self->set('row_user_id',$self->getDatabase->getDefaultUserId()) if (defined $self->getDatabase->getDefaultUserId() && !$self->get('row_user_id'));
  $self->set('row_group_id',$self->getDatabase->getDefaultGroupId()) if (defined $self->getDatabase->getDefaultGroupId() && !$self->get('row_group_id')); 
  $self->set('row_alg_invocation_id',$self->getDatabase->getDefaultAlgoInvoId()) if (defined $self->getDatabase->getDefaultAlgoInvoId() && !$self->get('row_alg_invocation_id')); 
  $self->set('user_read',$self->getDatabase->getDefaultUserRead()) if (!defined $self->get('user_read'));
  $self->set('user_write',$self->getDatabase->getDefaultUserWrite()) if (!defined $self->get('user_write'));
  $self->set('group_read',$self->getDatabase->getDefaultGroupRead()) if (!defined $self->get('group_read'));
  $self->set('group_write',$self->getDatabase->getDefaultGroupWrite()) if (!defined $self->get('group_write'));
  $self->set('other_read',$self->getDatabase->getDefaultOtherRead()) if (!defined $self->get('other_read'));
  $self->set('other_write',$self->getDatabase->getDefaultOtherWrite()) if (!defined $self->get('other_write'));
}

##begins and commits tranactions.....so can over-ride the submit method and still deal
##with the commit state appropriately
sub manageTransaction {
  my($self,$noTran,$task) = @_;
  return $self->getDatabase()->manageTransaction($noTran,$task);
}
  
sub isValidAttribute{
  my ($self,$att) = @_;
  return $self->getTable()->isValidAttribute($att);
}

##sets the foreign keys for all parents...
##note that if parent has not been submitted, it will be submitted to db non-recursive and then
## the id will be set.
sub setAllForeignKeys{
  my $self = shift;
  foreach my $p ($self->getAllParents()) {
    print STDERR "setAllForeignKeys: value of \$p = \"$p\"\n" if $debug == 1;
    if (! $p->getId()) {
      ##parent does not have primary key...need to submit
      $p->submit(1,1);          ##submit the parent notDeep so can get it's id...
      print STDERR "ERROR: ",$self->getClassName(),"::setAllForeignKeys - parent ",$p->getClassName()," does not have a primary key....submitting notDeep\n" if $debug;
      #			return undef;
    }
    if ($self->get($self->getParentSelfColumn($p->getClassName())) != $p->getId()) {
      print STDERR "  Ids are different so setting with new id ",$p->getId(),"\n" if $debug == 1;
      ##the ids are different so need to set....
      $self->set($self->getParentSelfColumn($p->getClassName()),$p->getId());
    }
  }
  return 1;
}

sub submitAllChildren{
  my($self) = @_;
  foreach my $className (keys%{$self->{'children'}}) {
    print STDERR "Submitting children in class $className\n" if $debug == 1;
    $self->submitChildrenInClass($className) unless $self->isImpClass($className); 
  }
}

sub submitChildren{
  my $self = shift;
  foreach my $c (@_) {
    $c->submit(undef,1);        ##submit so goes deep and NoTransaction as am already in a transaction
  }
}

##NOTE:  I think the ones that are NOT marked deleted should be submitted first then
##  the deleted ones...in case children have been transferred from deleted ones to the
##  ones that are not deleted as happens for Assemblies in incremental update.
sub submitChildrenInClass{
  my($self,$className) = @_;
  $className = $self->getTable()->getFullClassName($className);
  foreach my $c (sort{$a->isMarkedDeleted() <=> $b->isMarkedDeleted()}$self->getChildren($className,undef,1)) {
    print STDERR $self->getClassName().": Submitting child: deleted = '".$c->isMarkedDeleted()."'\n",$c->toString() if $debug == 1;
    $c->submit(undef,1);
  }
}

##check this...
##NOTE:  Need to make certain that all version tables are present...!
sub version{
  my $self = shift;
  return if(!$self->isVersionable());
  print STDERR "Versioning ",$self->getClassName(),"\n" if $debug;

  my @bindValues;
  my @bindAtts;
  my $keys = $self->getPrimaryKey();
  foreach my $att (keys%{$keys}){
    push(@bindValues,$keys->{$att});
    push(@bindAtts,$att);
  }

  my $stmt = $self->getTable()->getCachedStatement('insert','Version');
  
  if(!$stmt){
    my $where = "where v.$bindAtts[0] = ?";
    for(my $a=1;$a<scalar(@bindAtts);$a++){
      $where .= " and v.$bindAtts[$a] = ?";
    }
  # SJD Note that insert statement is different in Oracle than in 
  # sybase.  Insert into vs. Insert .  This will need to be cleaned up 
  # so we don't have to know what database we are using here.
    $stmt = $self->getDbHandle()->prepare( 'INSERT INTO '.$self->getVersionTableName()." select v.*,".$self->getDatabase()->getDefaultAlgoInvoId().",".$self->getDatabase()->getDateFunction().",".$self->getDatabase()->getTransactionId()." from ".$self->getTable()->getOracleTableName()." v $where");
    $self->getTable()->cacheStatement('insert','Version',$stmt);
    print STDERR "VersionSQL: ",$stmt->{Statement},"\n" if $debug;
  }

  return $self->getDbHandle()->sqlExec($stmt,\@bindValues);

}

sub getVersionTableName{
  my $self = shift;
  return $self->getTable()->getSchemaName()."Ver.".$self->getTableName() . "Ver";
}

##methods for printing and parsing XML format

# simple xml format
#
# <tableName>
#   <att_1>value</att_1>
#   <att_2>
# 	    value...
# 	    more value
#   </att_2>
#   <childTableName>
# 	<child_att_1>value</child_att_1>
# 	  .....
#   </childTableName>
#   <modification_date>date_value</modification_date>
# 	.....
# </tableName>

sub toXML {
  my($self,$indent,$suppressDef,$doXmlIds,$doParents,$family,$objRef) = @_; ##$family is arrayref of arrayrefs with child|parent and xml_id values
  print STDERR $self->getClassName()."->toXML: indent $indent\n" if $debug;
  my $space = "                                                                                                    ";
  my $xml = "";
  my $ext = $self->getTable();
  my $shortClassName = $self->getClassName();
  $shortClassName =~ s/GUS::Model:://;
  $xml = substr($space,0,$indent) . "<" . $shortClassName; 
  $xml .= ' xml_id="'.$self->getXmlId().'"' if $doXmlIds;
  $xml .= " objRef='$self'" if $objRef;
  foreach my $f (@{$family}) {
    $xml .= " $f->[0]=\"$f->[1]\"";
  }
  if ($doParents) {
    if (!$doXmlIds) {           ##need to print XML ids to do family..
      $xml .= ' xml_id="'.$self->getXmlId().'"';
    }
    foreach my $p ($self->getAllParents()) {
      $xml .= ' parent="' . $p->getXmlId(). '"';
    }
  }
  $xml .= ">\n";
  $indent += 2;                 ##increment indent by two each time
  foreach my $att (@{$ext->getAttributeList()}) {
    if ($att eq "user_read") {  ##want to put the children here...
      if ($self->getClassName() eq "AssemblySequence") {
        $xml .= substr($space,0,$indent) . "<sequence>\n" . CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),80 - $indent - 2,substr($space,0,$indent + 2)) . substr($space,0,$indent) . "</sequence>\n";
      }
      foreach my $c ($self->getAllChildren()) {
        $xml .= $c->toXML($indent,$suppressDef,$doXmlIds,$doParents,$family,$objRef);
      }
      last if $suppressDef;
    }
    if (length($self->get($att)) > 50) {
      if ($att eq 'sequence') {
        $xml .= substr($space,0,$indent) . "<sequence>\n" . CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),80 - $indent - 2,substr($space,0,$indent + 2)) . substr($space,0,$indent) . "</sequence>\n";
      } else {
        $xml .= substr($space,0,$indent) . "<$att>\n" . substr($space,0,$indent + 2) .
          $self->get($att) . "\n" . substr($space,0,$indent) . "</$att>\n";
      }
    } else {
      $xml .= substr($space,0,$indent) . "<$att>" . $self->get($att)."</$att>\n" if(defined $self->get($att)); # && $self->get($att) !~ /null/i);
    }
  }
  $xml .= substr($space,0,$indent - 2) . "</$shortClassName>\n";
  return $xml;
}

sub parseXML {
  my($self,$x,$index) = @_;
  my %data;
  my $tag;
  for (my $i = $index ? $index : 0;$i<scalar(@{$x});$i++) {
    print STDERR $x->[$i] if $debug;
#    if ($x->[$i] =~ /^\s*\<(\S+?)\>(.*?)\<\/.*?\>\s*$/) { ##is attribute on one line
		# modified to enforce tag matching.
    if ($x->[$i] =~ /^\s*\<(\S+?)\>(.*)\<\/\1\>\s*$/) { ##is attribute on one line
      print STDERR "Both end tag: $1-'$2'\n" if $debug;
      if ($1 eq 'sequence') {
        $self->setSequence($2);
      } else {
        $self->set($1,$2);
				print STDERR join('-', 'VERIFY', $self->get($1)), "\n" if $debug;
      }
    } elsif ($x->[$i] =~ /^\s*(.*?)\<\/\s*(\S*?)\s*\>\s*$/) { ##a closing tag
      print STDERR "Closing tag $2\n" if $debug;
      if ($self->getFullTableClassName($2) eq $self->getClassName()) {

				##here need to do the things necessary to deal with updates vs. inserts...
        if ($self->haveAllPrimaryKeyValues()) { ##have primary key therefore update....
          my $testO = $self->getClassName()->new($self->getPrimaryKey()); ##gets the primary key!!
          if ($testO->retrieveFromDB()) {
            print STDERR "parseXML->self\n".$self->toXML(undef,1)."parseXML->FromDB\n".$testO->toXML(undef,1) if $debug;
            my $dbo = $testO->getAttributes();
            foreach my $att (keys%{$dbo}) {
              $self->set($att,$dbo->{$att}) if (!defined $self->get($att));
            }
            print STDERR "parseXML->self after merge\n".$self->toXML(undef,1) if $debug;
            $self->synch();     ##guess the "h" at end is a mark special!!
            my @diffs = $testO->getAttributeDifferences($self);
            foreach my $att (@diffs) {
              print STDERR "parseXML: marking $att set for ".$self->getId()."\n" if $debug;
              $self->markAttributeSet($att);
            }
          }
        }

        return $i;              ##not $i+1 because will increment as is still in for loop...
      }
      if ($tag eq 'sequence' && $self->isValidAttribute($tag)) {
        $data{$tag} .= $1 if $1;
        $data{$tag} =~ s/\s//g;
        $data{$tag} =~ tr/a-z/A-Z/;
        $self->set('sequence',$data{$tag}) if exists $data{$tag};
        $self->setSequenceVersion($self->getSequenceVersion() + 1) unless $self->getId(); ##don't increment if am udpating
      } elsif ($self->isValidAttribute($tag)) {
        $data{$tag} .= $1 if $1;
        $self->set($tag,$data{$tag}) if exists $data{$tag};
      } else {
        die "parseXML line: '$x->[$i]'   line: ".($i+1).": '$tag' is NOT a valid attribute of ".$self->getClassName()."\n";
      }
    } elsif ($x->[$i] =~ /^\s*\<(\S+)\s*(.*)\>(.*?)\s*$/) { ##a beginning tag
      print STDERR "Beginning tag $1\n" if $debug;
      $tag = $1; my $xml_atts = $2; my $string = $3;
      if ($self->getDatabase()->checkTableExists($tag)) { ##is another table..child
	my $className = $self->getFullTableClassName($tag);
        eval("require $className");
        my $c = $className->new(undef,$self->getDatabase());
        $c->processXmlAttributes($xml_atts) if $xml_atts;
        $self->addChild($c) unless $xml_atts =~ /(parent|child)/; ##note that not certain this is right..
        ##might want to also addChild to the current object....but I don't think so...
        $i = $c->parseXML($x,$i+1); ##use $i+1 because want it to do the next line....
      }
      if ($string) {            #there is some data associated with this line;
        $string .= " " unless $x->[$i+1] =~ /^\s*\</;
        $data{$tag} = $string;
      }
    } else {                    ##just data
      $x->[$i] =~ s/^\s*(\S.*?)\s*$/$1/;
      $x->[$i] .= " " unless $x->[$i+1] =~ /^\s*\</;
      $data{$tag} .= $x->[$i];
    }
  }
}

sub processXmlAttributes {
  my($self,$xml_atts) = @_;
  foreach my $att (split(' ',$xml_atts)) {
    my($tag,$value) = split('=',$att);
    $value =~ s/\"//g;          ##strips quotes from ends
    $value =~ s/\'//g;          ##strips quotes from ends
    if ($tag eq "xml_id") { 
      print STDERR "Seting xml_id='$value' for ".$self->getClassName()."\n" if $debug;
      $self->setXmlId($value);
    } elsif ($tag eq "parent") { 
      print STDERR "Setting Parent xml_id = $value\n". $self->getObjectFromXmlId($value)->toXML(undef,1) if $debug;
      $self->setParent($self->getObjectFromXmlId($value));
    } elsif ($tag eq "child") {
      $self->addChild($self->getObjectFromXmlId($value));
    } else {
      print STDERR "invalid xml attribute\n";
    }
  }
}

sub getNextXmlId { my $self = shift; return $self->getDatabase()->getNextXmlId(); }

sub getXmlId { 
  my($self) = @_; 
  if (!exists $self->{'xml_id'}) {
    $self->setXmlId();
  }
  return $self->{'xml_id'}; 
}

sub setXmlId {
  my($self,$id) = @_;
  my $xml_id = $id ? $id : $self->getDatabase()->getNextXmlId();
  $self->{'xml_id'} = $xml_id;
  $self->getDatabase()->addToXmlHash($self);
}

sub getObjectFromXmlId {
  my($self,$xml_id) = @_;
  return $self->getDatabase()->getFromXmlHash($xml_id);
}

##method(s) to test for object equivalence...to hashref..

## $type = 1 if is string else 0 or undef to indicate numeric..
sub compareValues {
  my($self,$v1,$v2,$type) = @_;
  if ($type) {
    print STDERR "compareValues..quoted: $v1 eq $v2\n" if $debug;
    return 0 unless $v1 eq $v2;
  } else {
    print STDERR "compareValues..numeric: $v1 == $v2\n" if $debug;
    return 0 unless $v1 == $v2;
  }
}

sub testAttributeValues {
  my($self,$href) = @_;
  my $qtAtts = $self->getDatabase()->getTable($self->getClassName)->getQuoteHash();
  foreach my $att (keys%{$href}) {
    return 0 unless $self->compareValues($href->{$att},$self->get($att),$qtAtts->{$att});
  }
  return 1;
}

##tests to see if all atts that are set in $ob match with values I have...
##if I have extra atts...that is OK..
sub testObjectAttributeValues {
  my($self,$ob) = @_;
  return 0 unless $self->getClassName() eq $ob->getClassName();
  return $self->testAttributeValues($ob->getAttributes());
}

##takes in an object and determines  the attributes that are different!!
sub getAttributeDifferences {
  my($self,$ob) = @_;
  print STDERR "getAttributeDifferences $self vs. $ob\nself\n".$self->toXML(2)."new\n".$ob->toXML(2) if $debug;
  my @atts;
  my $href = $ob->getAttributes();
  my $qtAtts = $self->getDatabase()->getTable($self->getClassName)->getQuoteHash();
  foreach my $k (keys%{$href}) {
    push(@atts,$k) unless $self->compareValues($self->get($k),$href->{$k},$qtAtts->{$k});
  }
  return @atts;
}

## want to add methods for managing a list of objects to be submitted
## that are NOT children...all objects on the list will be submitted on submit
## of this object following the submit of this object.
## $self->{submitList}->{objectreference} = 1;
## removed from list following submit

sub addToSubmitList {
  my($self,@obs) = @_;
  foreach my $o (@obs){
    push(@{$self->{submitList}},$o);
  }
}

sub removeFromSubmitList {
  my($self,$o) = @_;
  my @tmp;
  foreach my $ob ($self->getSubmitList()){
    push(@tmp,$ob) unless "$ob" eq "$o";
  }
  $self->{submitList} = \@tmp;
}

sub getSubmitList {
  my($self) = @_;
  my @tmp;
  @tmp = @{$self->{submitList}} if defined $self->{submitList};
  return @tmp;
}

sub submitSubmitList {
  my($self) = @_;
  foreach my $ob ($self->getSubmitList()) {
    $ob->submit(undef,1);
  }
  delete $self->{submitList};
}

sub undefSubmitList {
  my($self) = @_;
  delete $self->{submitList};
}

## copy self...NOTE: this does not create a copy in the db...thus submitting either
##  the copy or self will update the same tuple in the db if object is from db....
sub copy {
  my $self = shift;
  my $copy = $self->getClassName()->new($self->getAttributes(),$self->getDatabase());
  return $copy;
}

sub getFullTableClassName {
  my ($self, $className) = @_;

  return $self->getDatabase()->getFullTableClassName($className);
}


1;


__END__

=pod

=head1 submit(1)

This is a recursive method downwards....does not do anything to the parents.  We could
implement something that also does parents in the future if this becomes an issue.  Submit
is called on all the children who in turn call it on their children.....

Takes one optional parameter (1) that indicates not to do a recursive submit. The default will
be to do a recursive submit.  This will be very useful for submitting a parent so that it has an ID and
in fact currently will happen automatically if in setting a foreign key the parent has not been
submitted to the database.

if isVersionable is not true then will not version.
if isUpdateable is NOT true then will not update, delete or insert self but will call a submit 
on all children which may be updated if their isUpdateable is true

Should make so returns value of 1 if successful and undef or 0 if not.  Is this implemented 
in SybTable?

=head2 isMarkedDeleted() returns 1

Need to delete self but first submit all children.  The semantics here are that following
deletion from the db, the object removes itself from any parents it has as it has been deleted.  
This also results in the parent removing the deleted child from it's list.  
Only those things in the current space will be deleted and then only if they have been marked
for deletion.  Thus, in order for a delete to work, one must retrieve all the children (and any
grandchildren..) and mark all deleted before deleting.  We could implement this automatically,
however, it seems that it could be very dangerous to do as would be recursive and could thus wind
up deleting a large chunk of the database accidentally.  This means that the programmer will need
to be very deliberate in order to delete items from the database successfully.
  
=head2  sets foreign keys and checks for nulls.

allForeignKeys are set at this point and the object is checked for non-nullables that are null.  If
any are found returns undef and throws an error message.
  
=head2 getId() returns a value...is already in the database.

Version self if versionable.
update self.
submit all children unless non-recursive submit.

=head2 No Id so inserts self.

insert self
submit all children unless non-recursive submit.

=cut

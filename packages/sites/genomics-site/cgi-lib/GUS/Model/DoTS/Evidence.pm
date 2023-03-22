
package GUS::Model::DoTS::Evidence; # table name
use strict;
use GUS::Model::DoTS::Evidence_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::Evidence_Row);

my $debug = 0;

sub addEvidenceFact {
	my($self,$fact) = @_;
	$self->{'evidenceFact'} = $fact;
}

sub getEvidenceFact {
	my($self,$retrieve) = @_;
	if(!exists $self->{'evidenceFact'} && $retrieve){
		$self->retrieveEvidenceFactFromDB();
	}
	return $self->{'evidenceFact'};
}

sub retrieveEvidenceFactFromDB {
	my($self,$resetIfHave) = @_;
	if(exists $self->{'evidenceFact'}){  ##already have fact for this one...
		next unless $resetIfHave;
	}
	my $dbh = $self->getDbHandle();
        my ($factTableName,$pk) = $self->getTableNameAndPK($self->get('fact_table_id'));
	my $evcmd = "select * from $factTableName". 
		" where $pk = ".$self->get('fact_id');
	print STDERR $self->getClassName()."->retrieveEvidenceFactsFromDB SQL = $evcmd\n" if $debug;

  my $sth = $dbh->prepareAndExecute($evcmd);
#	while(my(%fact) = $dbh->dbnextrow(1)){
  while (my $row = $sth->fetchrow_hashref()){
		#my $fact = $factTableName->new(\%fact);
		my $fact = $factTableName->new($row);
    next unless $fact->checkReadPermission();
		print STDERR "retrieveEvidenceFactsFromDB:\n".$fact->toXML(0,1)."\n" if $debug;
    ##NOTE that this does not group by evidence_group_id....do that on retrieval
		##NOTE...need to track what already have and not duplicate objs!!
		my $cachedFact = $self->getFromDbCache($factTableName,$fact->getConcatPrimKey());
		if($cachedFact && !$resetIfHave){  ##already have this one and don't reset!!
			print STDERR "Already have evidence fact with this ID: ".$self->getId()."\n" if $debug;
			$self->{'evidenceFact'} = $cachedFact;
		}else{
			$self->{'evidenceFact'} = $fact;
			$self->addToDbCache($fact,1);  ##the 1 causes it to replace if exists...
		}
	}
}

#connvenience method to returen tablename and primary key column name...
## caches so does not do require if already have
my $tablesAndPks = {};
sub getTableNameAndPK {
  my($self,$table_id) = @_;
  if(!exists $tablesAndPks->{$table_id}){
    my $tableName = $self->getTableNameFromTableId($table_id);
    eval("require $tableName");
    my $pk = $self->getTablePKFromTableId($table_id);
    $tablesAndPks->{$table_id} = [$tableName,$pk];
  }
  return @{$tablesAndPks->{$table_id}};
}

sub checkForRelation {
  my($self,$type) = @_;
  die "Evidence->checkForRelation: ERROR: invalid type '$type'\n" unless $type eq 'fact' || $type eq 'target';
  my($table_name,$pk) = $self->getTableNameAndPK($self->get($type."_table_id"));
  my $oracleName = &className2oracleName($table_name);
  my $stmt = $self->getDbHandle()->prepareAndExecute("select $pk from $oracleName where $pk = ".$self->get($type."_id"));  
  while(my($id) = $stmt->fetchrow_array()){
    $stmt->finish();
    return 1;
  }
  return 0;
}

##method to check to seethat both the target and fact row are still  in the db..
sub checkIfStillRelevant {
  my($self) = @_;
  if($self->checkForRelation('fact') && $self->checkForRelation('target')){
    return 1;
  }
  return 0;
}




1;

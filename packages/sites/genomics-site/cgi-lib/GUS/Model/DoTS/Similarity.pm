
package GUS::Model::DoTS::Similarity; # table name
use strict;
use GUS::Model::DoTS::Similarity_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::Similarity_Row);

my $debug = 0;

##method that sets the summary values (if they are not set) from the spans
##min_subject_start,max_subject_end,min_query_start,max_query_end,number_of_matches,total_match_length
##number_identical,number_positive
##NOT IMPLEMENTED YET!!!
sub setSummaryValuesFromSpans {
	my($self) = @_;
        print STDERR "Not implemented yet....any volunteers?\n";
	return undef unless $self->getChildren('DoTS::SimilaritySpan');
}

sub getSubjectLengthCovered {
  my $self = shift;
  my $cov = 0;
  my $end = 0;
  print STDERR "Similarity: Getting Length covered\n" if $debug;
  foreach my $s (sort {$a->getSubjectStart() <=> $b->getSubjectStart()} $self->getChildren('DoTS::SimilaritySpan',1)){
    print STDERR "SubStart: ",$s->getSubjectStart()," - SubEnd: ",$s->getSubjectEnd(),"\n" if $debug;
    $cov += $s->getSubjectStart() > $end ? $s->getSubjectEnd() - $s->getSubjectStart() + 1 : ($s->getSubjectEnd() > $end ? $s->getSubjectEnd() - $end : 0);
    $end = $s->getSubjectEnd() if $end < $s->getSubjectEnd();
    print STDERR "Coverage: $cov, End:$end\n" if $debug;
  }
  return $cov;
}



sub setPValue {
  my($self,$pval) = @_;
  my($mant,$exp);
  if($pval =~ /^(\S+)e(\S+)$/){
    $mant = $1;
    $exp = $2;
  }else{
    $mant = $pval == 0 ? 0 : $pval;
    $exp = $pval == 0 ? -999999 : 0;
  }
  $self->setPvalueMant($mant);
  $self->setPvalueExp($exp);
}

sub getPValue {
  my($self) = @_;
  return $self->getPvalueMant() . (($self->getPvalueExp() != -999999 && $self->getPvalueExp() != 0) ? "e" . $self->getPvalueExp() : "");
}

##retrieves the sequence objects without sequence by default
## where type eq 'query' or 'subject'
sub getSequenceObject {
  my($self,$type,$retrieveSequence) = @_;
  if(!$self->{"seqob_$type"}){
    my($table,$pk) = $self->getTableNameAndPK($self->get($type."_table_id"));
    my $seqOb = $table->new({$pk => $self->get($type."_id")});
    if($seqOb->retrieveFromDB($retrieveSequence ? undef : ['sequence','gapped_consensus','quality_values'])){ 
      $self->{"seqob_$type"} = $seqOb; 
    }
  }
  return $self->{"seqob_$type"};
}

sub generateSimilarityAlignment {
  my($self,$type) = @_;
  $type = $type ? $type : 'blast';
  ##first get the sequence objects....
  my $queryObj = $self->getSequenceObject('query');
  my $subjectObj = $self->getSequenceObject('subject');
  my $align;
  if(!$queryObj || !$subjectObj){
    print STDERR "ERROR: Similarity.".$self->getSimilarityId()." does not have sequence for both query and subject\n";
    return undef;
  }
  ##header information..
  my $kind = $type;
  $kind =~ tr/a-z/A-Z/;
  $align .= "Alignment: NOTE: Alignments have been regenerated using $kind pairwise comparisons\n";
  $align .= "Query = ".$queryObj->getClassName()."|".$queryObj->getId().($queryObj->isValidAttribute('source_id') && $queryObj->getSourceId() ? "|".$queryObj->getSourceId()." " : " "). $queryObj->getDescription()."\n\t(".$queryObj->getLength(). " Letters)\n\n";
    $align .= ">".$subjectObj->getClassName()."|".$subjectObj->getId().($subjectObj->isValidAttribute('source_id') && $subjectObj->getSourceId() ? "|".$subjectObj->getSourceId()." " : " "). $subjectObj->getDescription()."\n";
    $align .= "  Length = ".$subjectObj->getLength()."\n";
  ##now, do something with the HSPs
  my $ct = 1;
  my @sort;
  if($self->getScore() == "-1"){
    @sort = $self->getIsReversed ? sort{$b->getQueryStart() <=> $a->getQueryStart()}$self->getChildren('DoTS::SimilaritySpan',1) : sort{$a->getQueryStart() <=> $b->getQueryStart()}$self->getChildren('DoTS::SimilaritySpan',1);
  }else{
    @sort = sort{$b->getScore() <=> $a->getScore()}$self->getChildren('DoTS::SimilaritySpan',1);
  }
  foreach my $span (@sort){
    $align .= "  HSP_$ct: ".$span->generateHSPAlignment($type);
    $ct++;
  }
  return $align;
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
  die "Similarity->checkForRelation: ERROR: invalid type '$type'\n" unless $type eq 'query' || $type eq 'subject';
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
  if($self->checkForRelation('query') && $self->checkForRelation('subject')){
    return 1;
  }
  return 0;
}

1;

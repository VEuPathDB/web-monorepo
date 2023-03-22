
package GUS::Model::DoTS::RNAFeature; # table name
use strict;
use GUS::Model::DoTS::RNAFeature_Row;


use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::RNAFeature_Row);

my $debug = 0;

##if it has a parent_id that is a GeneFeature then get from exons
##else get in normal fashion...
##note that is_predicted must be set if predicted and the relationship
## with exons specified in RNAFeatureExon

sub getFeatureSequence {
	my $self = shift;
	print STDERR "RNAFeature->getFeatureSequence\n" if $debug;
	if(!exists $self->{'sequence'}) {
		if(!$self->get('is_predicted')){
			print STDERR "getFeatureSequence: is not predicted\n" if $debug;
			return $self->SUPER::getFeatureSequence();
		}
    my $snas = $self->getParent('DoTS::SplicedNASequence',1);
    if($snas && $snas->get('sequence')){
			$self->{'sequence'} = $snas->getSequence();
    }else{
      my @exons = $self->getExons();
      print STDERR "RNAFeature->getFeatureSequence: Have ",scalar(@exons)," exons\n" if $debug;
      foreach my $e (sort { $a->get('order_number') <=> $b->get('order_number')} @exons){
#		foreach my $e (sort { $a->getChild('DoTS::NALocation',1)->get('start_min') <=> $b->getChild('DoTS::NALocation',1)->get('start_min')} @exons){
        print STDERR "Getting ExonFeature sequence for exon: ".$e->get('order_number')." start=".$e->getChild('DoTS::NALocation',1)->get('start_min')."\n".$e->getFeatureSequence()."\n" if $debug;
        
        $self->{'sequence'} .= $e->getFeatureSequence();
      }
    }
	}
        print STDERR "getFeatureSequence: $self->{'sequence'}\n" if $debug;
	return $self->{'sequence'};
}

sub getExons {
    my $self = shift;
    my @exons;
    foreach my $r ($self->getChildren('DoTS::RNAFeatureExon',1)) {
	print STDERR "Retrieving exon: na_feature_id '".$r->getExonFeatureId()."'\n" if $debug;
	push(@exons,$r->getParent('DoTS::ExonFeature',1));
    }
    return @exons;
}

sub getFeatureLength {
	my $self = shift;
	if(!exists $self->{'featurelength'}){
		my $length = 0;
		foreach my $e ($self->getExons()){
			$length += $e->getFeatureLength();
		}
		$self->{'featurelength'} = $length;
	}
	return $self->{'featurelength'};
}

##returns the start and stop of the cds
sub getTranslationStartStop {
	my $self = shift;
  if($self->getTranslationStart() && $self->getTranslationStop()){
    return ($self->getTranslationStart(), $self->getTranslationStop());
  }
	my $start;
	my $stop = 0;
	my $length = 0;
	
	foreach my $e (sort { $a->get('order_number') <=> $b->get('order_number')} $self->getExons()) {
		$start = $length + $e->get('coding_start') if (defined $e->get('coding_start') && !$start); 
		$stop += $e->get('coding_end') if defined $e->get('coding_end');
		$length += $e->getFeatureLength();
	}
	$start = $start ? $start : 1;
	$stop = $stop ? $stop : $length;
  $self->setTranslationStart($start);
  $self->setTranslationStop($stop);
	return ($start,$stop);
}

1;

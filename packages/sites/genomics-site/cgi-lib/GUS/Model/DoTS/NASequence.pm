
package GUS::Model::DoTS::NASequence; # table name
use strict;
use GUS::Model::DoTS::NASequence_Row;
use GUS::Model::DoTS::VirtualSequence;
use CBIL::Bio::SequenceUtils;
#use GUS30::GUS_utils::Sequence;

use vars qw (@ISA);
@ISA = qw (GUS::Model::DoTS::NASequence_Row);

my $debug = 0;

sub getSequence {
    my $self = shift;
    my $ss = $self->SUPER::getSequence();

    if (!defined($ss) && ($self->getSubclassView() eq 'VirtualSequence')) {
        return &VirtualSequence::getSequence($self);
    }
    return $self->SUPER::getSequence();
}

sub setSequence{
	my($self,$sequence) = @_;
	print STDERR "setting sequence for ",$self->getClassName()," ",$self->getId(),"\nNew: $sequence\n\nOld: ",$self->get('sequence'),"\n\n" if $debug;
	$sequence =~ s/\s//g; ##removes any returns
	$sequence =~ tr/a-z/A-Z/;
  if($self->get('sequence') ne $sequence){
    $self->set('length',length($sequence)) unless $self->getLength() == length($sequence);
    $self->set('sequence',$sequence); 
  }
}

sub toFasta {
	my($self,$type) = @_;
	my $defline;
	if($type){  ##use source_id if available else use gusid
    $defline = ">".($self->get('source_id') ? $self->get('source_id') : $self->getId()).($self->get('secondary_identifier') ? "\|" . $self->get('secondary_identifier') : "")." ";
		$defline .= $self->get('description') if $self->get('description');
	}else{ 
		$defline = ">".$self->getId()."\|".($self->get('source_id') ? "\|" . $self->get('source_id') : '').($self->get('secondary_identifier') ? "\|" . $self->get('secondary_identifier') : "")." ";
		$defline .= $self->get('description') if $self->get('description');
  }
	return "$defline\n" . CBIL::Bio::SequenceUtils::breakSequence($self->getSequence());
}

##XML format for cap4
sub toCAML {
  my($self) = @_;
  my $caml;
  $caml = "  <SEQUENCE NAME=\"".$self->getId()."\">\n";
  $caml .= "    <BASE>\n".CBIL::Bio::SequenceUtils::breakSequence($self->getSequence(),74,'      ')."    </BASE>\n";
  ##print the quality values if exist
  if(exists $self->{quality}){ $caml .= "    <QUALITY>$self->{quality}</QUALITY>\n";}
  $caml .= "  </SEQUENCE>\n";
  return $caml;
}

1;


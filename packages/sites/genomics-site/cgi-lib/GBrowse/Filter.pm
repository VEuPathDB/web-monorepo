package GBrowse::Filter;

use strict;


sub filterByContigName {
  my ($f, $value) = @_;
  my ($contig) = $f->get_tag_values("Contig");

  $contig =~ /$value/;
}


sub filterByTaxon {
  my ($f, $value) = @_;
  my ($taxon) = $f->get_tag_values("Taxon");
  $taxon eq qq /$value/;
}


sub filterByTaxonAndContigName {
  my ($f, $taxon, $contig) = @_;
  &filterByTaxon($f, $taxon) && &filterByContigName($f, $contig);
}

sub filterByExtDbName {
  my ($f, $nm) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  $extdbname =~ /$nm/i;
}

sub filterByExtDbNameAndVersion {
  my ($f, $nm,$ver) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($dbversion) = $f ->get_tag_values('Version');   
  (($nm =~ /$extdbname/i) && ($ver =~ /$dbversion/i)); 
}


sub filterByExtDbNameAndFeatureType {
  my ($f, $nm, $tp) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($featuretype) = $f ->get_tag_values('FeatureType');
  (($extdbname =~ /$nm/i) && ($featuretype =~ /$tp/i));
}


sub filterByExtDbNameAndDescription { 
  my ($f, $nm, $desc) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($description) = $f->get_tag_values('Description');
  (($extdbname =~ /$nm/i) && ($description =~ /$desc/i));
}

sub filterByExtDbNameAndAttribute {
  my ($f, $nm,$attr,$val) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($attribute) = $f ->get_tag_values($attr);
  (($extdbname =~ /$nm/i) && ($attribute =~ /$val/i));
}

sub filterByExtDbNameAndSecondaryScore {
  my ($f, $nm, $ss) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($secondaryscore) = $f->get_tag_values('SecondaryScore');
  (($extdbname =~ /$nm/i) && ($secondaryscore >= $ss));
}

sub filterByDescription { 
  my ($f, $desc)  = @_;
  my $description = $f->get_tag_values('Description');
  ($description !~ /$desc/i);
}


1;

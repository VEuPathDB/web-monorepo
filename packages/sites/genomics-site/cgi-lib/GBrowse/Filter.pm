package GBrowse::Filter;

use strict;


sub filterByExtDbNameAndFeatureType {
  my ($f, $nm, $tp) = @_;
  my ($extdbname) = $f->get_tag_values('ExtDbName');
  my ($featuretype) = $f ->get_tag_values('FeatureType');
  (($extdbname =~ /$nm/i) && ($featuretype =~ /$tp/i));
}


1;

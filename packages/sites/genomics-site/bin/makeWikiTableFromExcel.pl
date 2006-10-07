#!/usr/bin/perl

##turn an excel  table into a wiki table

use strict;
use Spreadsheet::BasicRead;

my $file = shift;
my $ss = Spreadsheet::BasicRead->new($file) || die "Could not open '$file': $!";

while(my $data = $ss->getNextRow()){
  next unless $data;
  my $a = 0;
  for($a;$a < scalar(@$data);$a++){
    print sprintf('%*s',$a*3,"").($a == scalar(@$data)-1 ? ($data->[$a] ? "$data->[$a]\n" : ".\n")
                                  : "$data->[$a]".($data->[$a] ? " |\n" : "|\n"));
  }
}

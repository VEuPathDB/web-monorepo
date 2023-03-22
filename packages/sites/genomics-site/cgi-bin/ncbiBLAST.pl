#!/usr/bin/perl 


use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::NcbiBLAST;

my $app =
  ApiCommonWebsite::View::CgiApp::NcbiBLAST->new();

$app->go();

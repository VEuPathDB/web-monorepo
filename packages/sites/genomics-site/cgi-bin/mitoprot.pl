#!/usr/bin/perl                                                                                                                     

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::Mitoprot;

my $app =
    ApiCommonWebsite::View::CgiApp::Mitoprot->new();

$app->go();


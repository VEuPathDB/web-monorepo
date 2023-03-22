#!/usr/bin/perl                                                                                                                     


use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::ChloroP;

my $app =
    ApiCommonWebsite::View::CgiApp::ChloroP->new();

$app->go();

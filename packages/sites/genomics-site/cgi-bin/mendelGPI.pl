#!/usr/bin/perl                                                                                                                    

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::MendelGPI;

my $app =
    ApiCommonWebsite::View::CgiApp::MendelGPI->new();

$app->go();


#!/usr/bin/perl                                                                                                                    

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::STRING;

my $app =
    ApiCommonWebsite::View::CgiApp::STRING->new();

$app->go();


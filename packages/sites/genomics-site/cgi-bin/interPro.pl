#!/usr/bin/perl                                                                                                                    

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::InterPro;

my $app =
    ApiCommonWebsite::View::CgiApp::InterPro->new();

$app->go();

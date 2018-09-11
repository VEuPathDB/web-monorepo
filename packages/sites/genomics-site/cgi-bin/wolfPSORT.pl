#!/usr/bin/perl                                                                                                                     


use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';


use ApiCommonWebsite::View::CgiApp::WolfPSORT;

my $app =
    ApiCommonWebsite::View::CgiApp::WolfPSORT->new();

$app->go();


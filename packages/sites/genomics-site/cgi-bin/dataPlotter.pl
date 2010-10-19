#! @perl@ -w

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';
$ENV{R_PROGRAM} = '@rProgram@';
$ENV{R_LIBS} = '@cgilibTargetDir@/R';

die "targetDir macro undefined" if !$ENV{GUS_HOME};
die "rProgram macro undefined" if !$ENV{R_PROGRAM};
die "cgilibTargetDir macro undefined" if !"@cgilibTargetDir@";

use constant DEBUG => 0;

use ApiCommonWebsite::View::CgiApp::DataPlotter;


DEBUG && print STDERR "# $0 --------------------------------------------------------\n";

ApiCommonWebsite::View::CgiApp::DataPlotter->new()->go();


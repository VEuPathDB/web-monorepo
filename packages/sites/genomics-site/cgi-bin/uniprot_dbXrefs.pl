#! @perl@ -w

use strict;

use lib "@targetDir@/lib/perl";
$ENV{GUS_HOME} = '@targetDir@';

die "targetDir macro undefined" if !$ENV{GUS_HOME};

use constant DEBUG => 0;

use ApiCommonWebsite::View::CgiApp::UniprotDBXRefs;


DEBUG && print STDERR "# $0 --------------------------------------------------------\n";

ApiCommonWebsite::View::CgiApp::UniprotDBXRefs->new()->go();


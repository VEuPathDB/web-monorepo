#! @perl@ -w

use strict;

use lib "@targetDir@/lib/perl";

use constant DEBUG => 1;

use ApiCommonWebsite::View::CgiApp::DataPlotter;

DEBUG && print STDERR "# $0 --------------------------------------------------------\n";

ApiCommonWebsite::View::CgiApp::DataPlotter->new()->go();


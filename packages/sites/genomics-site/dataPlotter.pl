#! @perl@ -w

use strict;

use lib "@targetDir@/lib/perl";

use constant DEBUG => 1;

use PlasmoDBWebsite::View::CgiApp::DataPlotter;

DEBUG && print STDERR "# $0 --------------------------------------------------------\n";

PlasmoDBWebsite::View::CgiApp::DataPlotter->new
( ConfigFile => "@targetDir@/config/gus.config",
)->go();


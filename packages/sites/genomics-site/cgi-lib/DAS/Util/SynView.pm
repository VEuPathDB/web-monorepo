package DAS::Util::SynView;

sub postgridGB2 {
  my ($gd, $panel) = @_;
  $gd->alphaBlending(0);
  $gd->saveAlpha(1);
  #$panel->boxes();    # causes the layout to be calculated
  use Tie::IxHash;
  use Data::Dumper;
  my %orthologs;
  my %location;
  my %drawn;
  my %newdrawn;
  my @group;
  my %seen;
  my $exon_x2 = 0;
  foreach my $box (@{$panel->boxes}) {
      my ($f, $x1, $y1, $x2, $y2) = @$box;
      #$exon_x2 = $x2 and next if ($f->type =~ /exon|CDS|UTR/i);
      #$location{$f->name} = [$x1, $y1, $exon_x2, $y2];
      $location{$f->name} = [$x1, $y1, $x2, $y2]; # without box_subparts
      next unless $f->isa("Bio::SeqFeatureI");
      next if $f->isa("Bio::Das::Feature");
      my $gene = $f->name;
      my $type = $f->type;
      last unless $type =~ /synteny/i;
      my @og = ();
      if(!exists $seen{$gene}) {
        $seen{$gene}++;
        my @orthologs = $f->get_tag_values("Ortholog");
        next unless @orthologs;
        foreach (@orthologs) {
          my $g = @$_[0];
          $seen{$g}++;
          push @og, $g;
        }
        push @og, $gene;
        push @group, \@og;
      }
  }
  foreach my $g (@group) {
    my @new;
    foreach (@$g) {
      push @new, $location{$_} if (exists $location{$_});
    }
    my @sorted = sort { $a->[1] <=> $b->[1] } @new;
    my $size = @sorted;
    #warn "size: $size";
    for(my $i=0; $i< $size-1; $i++) {
      my ($x1, $y1, $x2, $y2) = @{$sorted[$i]};
      my ($ox1, $oy1, $ox2, $oy2) = @{$sorted[$i+1]};
      #warn "sorted: $x1, $y1, $ox1, $oy1";
      my $polygon = GD::Polygon->new();
      $polygon->addPt($x1, $y2);
      $polygon->addPt($x2, $y2);
      $polygon->addPt($ox2, $oy1);
      $polygon->addPt($ox1, $oy1);
      $gd->filledPolygon($polygon, $gd->colorAllocateAlpha($panel->color_name_to_rgb("darkgray"), 100));
      $gd->line($x1, $y2, $ox1, $oy1, $panel->translate_color("lightsteelblue"));
      $gd->line($x2, $y2, $ox2, $oy1, $panel->translate_color("lightsteelblue"));
    }
  }
}

sub postgrid {
  my ($gd, $panel) = @_;
  $gd->alphaBlending(0);
  $gd->saveAlpha(1);
  $panel->boxes();    # causes the layout to be calculated
  use Tie::IxHash;
  my %orthologs;
  my %location;
  my %drawn;
  my %newdrawn;
  for my $track (@{$panel->{tracks}}) {
    for my $part (@{$track->{parts}}) {
      my $feature = $part->{feature};
      next unless $feature->isa("Bio::SeqFeatureI");
      next if $feature->isa("Bio::Das::Feature");
      my @orthologs = $feature->get_tag_values("Ortholog");
      next unless @orthologs;
      my $gene = $feature->name;
      for my $ortholog (@orthologs) {
        unless (exists $orthologs{$ortholog->[0]}) {
          tie(%{$orthologs{$ortholog->[0]}}, "Tie::IxHash");
        }
        $orthologs{$ortholog->[0]}->{$gene}++;
      }
      my $yoffset = $panel->track_position($track);
      my $padleft = $panel->pad_left();
      my ($x1, $y1, $x2, $y2) = $part->bounds();
      $x1 += $padleft;
      $x2 += $padleft;
      $y1 += $yoffset - 2;
      $y2 += $yoffset + 2;
      $location{$gene} = [ $x1, $y1, $x2, $y2 ];
      if (exists $orthologs{$gene}) {
        ORTHOLOGS : for my $ortholog (keys %{$orthologs{$gene}}) {
          unless (exists $location{$ortholog}) {
            warn "no location for $ortholog (ortholog of $gene)\n";
            next ORTHOLOGS;
          }
          if ($drawn{$ortholog}) {
            for my $coortholog (@orthologs) {
              next ORTHOLOGS if $drawn{$ortholog}->{$coortholog->[0]};
            }
          }
          $newdrawn{$ortholog}->{$gene}++;
          my ($ox1, $oy1, $ox2, $oy2) = @{$location{$ortholog}};
          my $polygon = GD::Polygon->new();
          $polygon->addPt($ox1, $oy2);
          $polygon->addPt($ox2, $oy2);
          $polygon->addPt($x2, $y1);
          $polygon->addPt($x1, $y1);
          $gd->filledPolygon($polygon, $gd->colorAllocateAlpha($panel->color_name_to_rgb("darkgray"), 100));
          # $gd->openPolygon($polygon, $gd->colorAllocateAlpha($panel->color_name_to_rgb("lightsteelblue"), 0));
          $gd->line($ox1, $oy2, $x1, $y1, $panel->translate_color("lightsteelblue"));
          $gd->line($ox2, $oy2, $x2, $y1, $panel->translate_color("lightsteelblue"));
      }
    }
  }
  while (my ($key, $value) = each %newdrawn) {
    $drawn{$key} = { %{$drawn{$key} || {}}, %{$value || {}} };
  }
  %newdrawn = undef;
 }
}

1;

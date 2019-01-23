package org.apidb.apicommon.model.view.genome;

public class Feature implements Comparable<Feature> {

  private final String sourceId;
  private final boolean forward;
  private final String sequenceId;
  private long start;
  private long end;
  private double percentStart;
  private double percentLength;
  private String context;
  private String description;

  public Feature(String sourceId, String sequenceId, boolean forward) {
    this.sourceId = sourceId;
    this.sequenceId = sequenceId;
    this.forward = forward;
  }

  public Feature(Feature feature) {
    this.context = feature.context;
    this.end = feature.end;
    this.forward = feature.forward;
    this.percentLength = feature.percentLength;
    this.percentStart = feature.percentStart;
    this.sequenceId = feature.sequenceId;
    this.sourceId = feature.sourceId;
    this.start = feature.start;
    this.description = feature.description;
  }

  public String getSourceId() {
    return sourceId;
  }

  public String getSequenceId() {
    return sequenceId;
  }

  public boolean isForward() {
    return forward;
  }

  public String getStrand() {
    return forward ? "forward" : "reversed";
  }
  
  public long getLength() {
    return (end - start + 1);
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public long getStart() {
    return start;
  }

  public String getStartFormatted() {
    return GenomeViewHandler.FORMAT.format(start);
  }

  public void setStart(long start) {
    this.start = start;
  }

  public long getEnd() {
    return end;
  }

  public String getEndFormatted() {
    return GenomeViewHandler.FORMAT.format(end);
  }

  public void setEnd(long end) {
    this.end = end;
  }

  public double getPercentStart() {
    return percentStart;
  }

  public void setPercentStart(double percentStart) {
    this.percentStart = percentStart;
  }

  public double getPercentLength() {
    return percentLength;
  }

  public void setPercentLength(double percentLength) {
    this.percentLength = percentLength;
  }

  public void setContext(String context) {
    this.context = context;
  }

  public String getContext() {
    return sequenceId + ":" + context;
  }

  @Override
  public int compareTo(Feature feature) {
    if (feature != null) {
      int diff = (int) (this.start - feature.start);
      return (diff == 0) ? (int) (this.end - feature.end) : diff;
    }
    else
      return -1;
  }
}

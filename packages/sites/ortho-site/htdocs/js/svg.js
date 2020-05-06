// cookie names
$(document).ready(function() {
    document.svg = new Svg();
    document.svg.addNodeMotion();
    document.svg.addEdgeMotion();
    document.svg.addControlMotion();
    document.svg.showLegend();
});

function Svg() {

    this.info1 = $("#info1");
    this.info2 = $("#info2");
    this.info3 = $("#info3");
    this.info4 = $("#info4");

    this.addNodeMotion = function() {
        var svg = this;
        $("#All circle").each(function() {
            var gene = $(this).attr("id");
            var taxon = $(this).parent();
            $(this).hover(function() {
                    taxon.children("circle").attr("r", "7");
                    $("#legend #" + taxon.attr("id")).attr("r", "7");
                    svg.info1.text("Source Id: " + $(this).attr("name"));
                    svg.info2.text("Organism: " + taxon.attr("name") + " (" + taxon.attr("abbrev") + ")");
                    svg.info3.text("Product: " + $(this).attr("description"));
                },
                function() {
                    taxon.children("circle").attr("r", "5");
                    $("#legend #" + taxon.attr("id")).attr("r", "5");
                    svg.info1.text("");
                    svg.info2.text("");
                    svg.info3.text("");
                }
            );
            $(this).click(function() {
                var gene = $(this).attr("id");
                $("#All line").each(function() {
                    var query = $(this).attr("query");
                    var subject = $(this).attr("subject");
                    var display = (gene == query || gene == subject) ? "block" : "none";
                    $(this).attr("display", display);
                });
            });
        });
    };

    this.addEdgeMotion = function() {
        var svg = this;
        $("#All line").each(function() {
            var queryId = $(this).attr("query");
            var subjectId = $(this).attr("subject");
            var query = $("circle#" + queryId);
            var subject = $("circle#" + subjectId);
            var type = $(this).parent().attr("id");
            if (type == "Normal") type = "Other Similar match";
            $(this).hover(function() {
                    this.setAttributeNS(null,"style","stroke-width:4;");
                    $(this).attr("stroke-width", "5");
                    query.attr("r", "7");
                    subject.attr("r", "7");
                    svg.info1.text("Edge between: " + query.attr("name") + " - " + subject.attr("name"));
                    svg.info3.text("Edge type: " + type + " edge");
                    svg.info4.text("BLASTP evalue: " + $(this).attr("evalue"));
                },
                function() {
                    this.setAttributeNS(null,"style","stroke-width:2;");
                    query.attr("r", "5");
                    subject.attr("r", "5");
                    svg.info1.text("");
                    svg.info2.text("");
                    svg.info3.text("");
                    svg.info4.text("");
                }
            );
        });
    };

    this.addControlMotion = function() {
        this.addControlMotionByType("Ortholog");
        this.addControlMotionByType("Coortholog");
        this.addControlMotionByType("Inparalog");
        this.addControlMotionByType("Normal");
        this.addControlMotionByType("All");
    };

    this.addControlMotionByType = function(type) {
        $("#control #" + type + "_switch").each(function() {
            $(this).hover(function() {
                    $(this).attr("fill", "red");
                },
                function() {
                    $(this).attr("fill", "black");
                }
            );
            $(this).click(function() {
                var display = ($(this).text().substr(0, 4) == "Show") ? "block" : "none";
                var next = (display == "block") ? "Hide" : "Show"
                var rest = $(this).text().substr(4);
                $(this).text(next + rest);
                $("#" + type + " line").each(function() {
                    $(this).attr("display", display);
                });
            });
        });
    };

    this.showLegend = function() {
        var svg = this;
        var x = 810;
        var y = 35;
        var legend = document.getElementById("legend");
        $("#All g[class=taxon]").each(function() {
            var taxon = $(this);
            var id = taxon.attr("id");
            var abbrev = taxon.attr("abbrev");
            var name = taxon.attr("name");
            var genes = taxon.children("circle");
            var color = genes.attr("fill");

            var svgNS = "http://www.w3.org/2000/svg";
            var circle = document.createElementNS(svgNS,"circle");
            circle.setAttributeNS(null, "id", id);
            circle.setAttributeNS(null, "class", "taxon");
            circle.setAttributeNS(null, "cx", x);
            circle.setAttributeNS(null, "cy", y);
            circle.setAttributeNS(null, "r", "5");
            circle.setAttributeNS(null, "abbrev", abbrev);
            circle.setAttributeNS(null, "name", name);
            circle.setAttributeNS(null, "fill", color);
            legend.appendChild(circle);

            var text = document.createElementNS(svgNS,"text");
            text.setAttributeNS(null, "x", x + 10);
            text.setAttributeNS(null, "y", y + 3);
            legend.appendChild(text);
            text.appendChild(document.createTextNode(abbrev));

            // add events
            $("#legend #" + id).hover(function() {
                    $(this).attr("r", "7");
                    genes.attr("r", "7");
                    svg.info1.text(abbrev);
                    svg.info2.text(name);
                    svg.info3.text(genes.length + " genes");
                },
                function() {
                    $(this).attr("r", "5");
                    genes.attr("r", "5");
                    svg.info1.text("");
                    svg.info2.text("");
                    svg.info3.text("");
                }
            );

            x += 65;
            if (x >= 950) {
                x = 810;
                y += 18;
            }

        });
    };
}

<?php
    // get list of js files
    $curr_dir = getcwd();
    $js_dir = $_SERVER['GUS_HOME'] . '/../webapp/wdk/src';

    chdir($js_dir) or die("Could not change to $js_dir");
    $js_files = glob('*.js');
    chdir($curr_dir);
?>

<style>
  .fail {
    color: red !important;
  }
  .pass {
    color: green !important;
  }
  #jsfiles .expandable {
    background-color: #eee;
    padding-bottom: 5px;
  }
  #jsfiles li {
    padding: 0.5em 0;
  }
  .error .evidence {
    font-family: monospace;
  }
</style>

<h2>WDK JSLint Utility</h2>
<p>Below is a list of JavaScript files shipped with Strategies WDK. Expand each item to see details of the report.
    <a href="http://www.JSLint.com">http://www.JSLint.com</a> for more information</p>

<p class="smalltext"><span class="expand_all clickable smalltext">expand all</span> | <span class="collapse_all clickable smalltext">collapse all</span></p>

<?php if (count($js_files) > 0): ?>
  <div id="jsfiles">
    <?php foreach ($js_files as $js_file): ?>
        <p class="clickable"><span class="filename"><?php echo $js_file; ?></span> &#8593;&#8595;</p>
        <div class="expandable"></div>
    <?php endforeach; ?>
  </div>
<?php else: ?>
    <p>Could not find any JavaScript files</p>
<?php endif; ?>
<script src="js/jquery.mustache.js"></script>
<script src="js/jslint.js"></script>
<script>
  $(function() {
    var js_dir = "/wdk/src",
        errors_template = $("#errors_template").html(),
        JSLINT_OPTS = {
          browser  : true,
          maxerr   : 100,
          eqeq     : true,
          nomen    : true,
          plusplus : true,
          undef    : true,
          sloppy   : true,
          vars     : true,
          white    : true
        };
    //$("#jsfiles").accordion({collapsible: true, active: false});
    $("#jsfiles .filename").each(function(i, el) {
      var jsfile = $(el).text(),
          content_container = $(el).parent().next();

      $.ajax({
        url: "<?php echo $_SERVER['CONTEXT_PATH']; ?>" + js_dir + "/" + jsfile,
        success: function(data, textStatus, jqXHR) {
          var stop_err_msg,
              jsl_result = JSLINT(data, JSLINT_OPTS),
              jsl_data = JSLINT.data();

          $(el).addClass(jsl_result ? "pass" : "fail")
              .attr("title", "Click to see " + jsl_data.errors.length + " errors.");

          if (jsl_data.errors[jsl_data.errors.length - 1] === null) {
            stop_err_msg = "A stopping error was found. This might mean that more than " +
                JSLINT_OPTS.maxerr + " errors were found. It might also mean something else...";
            jsl_data.errors.pop();
          }
          content_container.html($.mustache(errors_template, jsl_data));
          if (stop_err_msg) {
            content_container.append($("<p>" + stop_err_msg + "</p>").addClass("fail"));
          }

        },
        dataType: "text"
      });

    });
  });
</script>
<script id="errors_template" type="text/template">
  <ol>
    {{#errors}}
    <li class="error">
      <div class="reason">{{reason}}</div>
      <div class="evidence">{{evidence}} (line {{line}}, char {{character}})</div>
    </li>
    {{/errors}}
  </ol>
</script>

<html>
  <head>
    <title>File Upload Form</title>
    <script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>
    <script type="text/javascript">
      var addFormField = function() {
    	  var fieldCount = 1;
    	  return function() {
    		  fieldCount++;
    		  var html = 'File ' + fieldCount + ': <input type="file" name="file' + fieldCount + '"/><br/>';
    		  $('#uploadFields').append(html);
    	  }
      }();
    </script>
  </head>
  <body>
    <form method="post" action="uploadTest.do" enctype="multipart/form-data">
      <h3>Upload a file!</h3>
      <div id="uploadFields">
        File 1: <input type="file" name="file1"/><br/>
      </div>
      <a href="javascript:addFormField()">Add another file...</a><br/>
      <input type="submit" value="Submit"/>
    </form>
  </body>
</html>
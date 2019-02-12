var linkToServer = "http://localhost:3000/";

function showStatus(result, label) {
  $(label).text("Status: " + result);
};

document.addEventListener('DOMContentLoaded', function() {
  //Start scraping
  $("#startScraping").click(function() {
    $.ajax({
      type: "GET",
      url: linkToServer + 'startScraping',
      dataType: 'json',
      contentType: 'application/json',
      success: function(res) {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayStartScraping');
      },
      error: function() {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayStartScraping');
      }
    });
  });

  //Write into the S3 file
  $("#writeS3File").click(function() {
    $.ajax({
      url: linkToServer + 'writeS3File',
      dataType: 'json',
      contentType: 'application/json',
      success: function(res) {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayWriteS3File');
      },
      error: function() {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayWriteS3File');
      }
    });
  });

  //Read data from the S3 file
  $("#readS3File").click(function() {
    $.ajax({
      type: "GET",
      url: linkToServer + 'readS3File',

      dataType: 'json',
      contentType: 'application/json',
      success: function(res) {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayReadS3File');
      },
      error: function() {
        //Show status
        console.log(res);
        showStatus(res.status, '#displayReadS3File');
      }
    });
  });

}, false);

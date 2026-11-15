/** Google Apps Script pasted into a Sheet's Apps Script editor to receive submissions. */
export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var answers = data.answers || [];
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      var headers = ["Submission ID", "Submitted At"];
      for (var i = 0; i < answers.length; i++) {
        headers.push(answers[i].label || answers[i].key);
      }
      sheet.appendRow(headers);
    }
    
    // Append submission row
    var row = [data.submissionId, data.submittedAt];
    for (var j = 0; j < answers.length; j++) {
      row.push(answers[j].value);
    }
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`

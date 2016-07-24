var MASTER_DOC = "https://docs.google.com/spreadsheets/d/1jufYTmHK-NxHLpbtb4pt28ueXyMO1RK-QzG7_ZgguYc/pubhtml";

function main()
{

  var master_sheet = SpreadsheetApp.openByUrl(MASTER_DOC).getSheetByName("Sheet1");
  var range = master_sheet.getRange("A2:A300");
  var data_values=master_sheet.getDataRange().getValues();  
  
  
  for (var n = 1;n < data_values.length;n++)
  {
    Logger.log(n)
    var accountSelector = MccApp.accounts().withIds([data_values[n][0]]);
    var accountIterator = accountSelector.get();  
    if (accountIterator.hasNext()) 
    {
      // Get the current account.
      var account = accountIterator.next();
      var accountName = account.getName();
      // Select the child account.
      MccApp.select(account);
      Logger.log("Account with CID "+[data_values[n][0]]+" and name " + accountName + " selected")      
    }
    
    var campaignIterator = AdWordsApp.campaigns().get();
    
    while (campaignIterator.hasNext()) 
   {
     var campaign = campaignIterator.next();
     var campaignName = campaign.getName();
     Logger.log(campaignName);
     var mobileTargetIterator = campaign.targeting().platforms().mobile().get();
     if (mobileTargetIterator.hasNext()) 
     {
       mobileTarget = mobileTargetIterator.next();
       // Set the bid modifier for mobile platform.
       mobileTarget.setBidModifier(.1);
       Logger.log("Mobile Multiplier Set")
     }
   }
  }
}
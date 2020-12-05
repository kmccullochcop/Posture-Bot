/**
Twitter bot by Kathleen McCulloch-Cop (Dec. 2020)
@situpstr8bot tweets posture and stretch reminders every half hour
*/

const sheetID = "sheetID";
const keysRange = 'KeysRange'; 
const tweetsRange ='TweetsRange';

/**
* Authorizing access to bot using Twitter Library (https://github.com/airhadoken/twitter-lib)
*
* @return {OAuth} an OAuth instance authorized for bot access, null if otherwise
*/
function login(){
  var keys = Sheets.Spreadsheets.Values.get(sheetID, keysRange).values;
   var twitterKeys= {                                                                        
    TWITTER_CONSUMER_KEY: keys[0].toString(),
    TWITTER_CONSUMER_SECRET: keys[1].toString(),
    TWITTER_ACCESS_TOKEN: keys[2].toString(),
    TWITTER_ACCESS_SECRET: keys[3].toString()    
  };
  
  var props = PropertiesService.getScriptProperties();  
  
  
  props.setProperties(twitterKeys);                                                               
  var service = new Twitter.OAuth(props)
  return service;
}

/**
* Create OAuth object and calls send tweet method
*
* @param {string} the contents of the tweet to be sent
*/
function sendPostureReminder (tweet) {
  
  var service = login();
  
  if (service.hasAccess()) {
    try{
      var result = sendTweet(service, tweet.toString()); //using in place of service.sendTweet to avoid invalid access token error
      Logger.log(result);
    }
    catch (e){
      Logger.log(e.toString());
    }
  }
}

/**
* Find index of tweet to be sent, call send PostureReminder
*/
function generateTweet(){
  
  var tweets = Sheets.Spreadsheets.Values.get(sheetID, tweetsRange).values;
  var count = Math.floor(Math.random()*100);
  if(count < tweets.length){
    sendPostureReminder(tweets[count]);
  }
  else{
    sendPostureReminder(tweets[0]);
  }
}

/**
* Create Triggers and start tweeting every 30 mins
*/
function setTiming () {
  
  // clear any existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // get the value set in the timing menu
  
  var trigger = ScriptApp.newTrigger("generateTweet").timeBased().everyMinutes(30).create();
  
  Logger.log(trigger);
}

/**
* Delete all triggers and stop tweeting
*/
function clearTiming () {
  // clear any existing triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
}

/**
* Add testing, start tweeting, and stop tweeting options to menu in sheet
*/
function onOpen() {
  
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Bot Commands').addItem('Send a Test Tweet', 'generateTweet').addItem('Start Posting Tweets', 'setTiming').addItem('Stop Posting Tweets', 'clearTiming').addToUi();
}

/**
* Get callback URL from Twitter Library for use with developer.twitter.com
*/
function getCallback(){
  Logger.log(Twitter.getCallbackUrl(projectID));
}

/**
* Essentially a copy of sendTweet function from Twitter Library (one in Twitter Library was throwing invalid access token error)  
*
* @param {Oauth} Oauth service authorized with bot keys
* @param {string} tweet to be sent
* @param {optional object} any additional parameters to be sent with tweet
* @return {object} the Twitter response as an object if successful, null otherwise 
*/
function sendTweet(service, tweet, params, options) {
  var i;
  var payload = {
    "status" : (tweet.text || tweet)
  };
  if(params == null || params.decode !== false) {
    payload.status = payload.status
      .replace(/&(gt|lt|amp);/g, function(str, code) { //encoding special chars
        var lookup = {
          gt: ">",
          lt: "<",
          amp: "&"
        }
        return lookup[code];
      });
  }
  
  service.checkAccess();
  if(params) {
    delete params.decode;
    for(i in params) {
      if(params.hasOwnProperty(i)) {
        payload[i.toString()] = params[i];   
      }
    }
  }
  options = options || {};
  options.method = "POST";
  options.payload = payload;
  
  var status = "https://api.twitter.com/1.1/statuses/update.json";
  
  
  
  try {    
    var result = service.fetch(status, options);
    Logger.log("Send tweet success. Response was:\n" + result.getContentText("UTF-8") + "\n\n"); 
    return JSON.parse(result.getContentText("UTF-8"));
  } catch (e) {
    Logger.log(e.toString());
    Logger.log("Send tweet failure. Error was:\n" + JSON.stringify(e) + "\n\noptions were:\n" + JSON.stringify(options) + "\n\n");
    return null;
  }
    
}

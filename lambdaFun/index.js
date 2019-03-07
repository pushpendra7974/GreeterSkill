'use strict'

var http = require('http');
exports.handler = function(event,context){
    try
    {
        var request = event.request;
        var session = event.session;

        if(!event.session.attributes){
            event.session.attributes={};
        }

        /**
         * Types of Requests:-
         * 1. LaunchRequest
         * 2. IntentRequest
         * 3. SessionEndedRequest 
         **/

        if(request.type === "LaunchRequest"){

            handleLaunchRequest(context);

        }else if(request.type === "IntentRequest"){
            
            if(request.intent.name === "HelloIntent"){
                
                handleHelloIntent(request, context);                
            
            }else if(request.intent.name === "QuoteIntent"){

                handleQuoteIntent(request, context, session);

            }else if(request.intent.name === "NextQuoteIntent"){
                
                handleNextQuoteIntent(request, context, session);

            }else if(request.intent.name === "AMAZON.StopIntent"||request.intent.name === "AMAZON.CancelIntent"){
            
                context.succeed(buildResponse({
                    speechText:"Good Bye. See you again next time. ",
                    endSession :true
                }));

            }else{
                throw "Unknown Intent Type";
            }

        }else if(request.type === "SessionEndedRequest"){

        }else{
            throw "Unknown Intent Type";
        }
    }
    catch(e)
    {
        context.fail("Exception : "+ e);
    }
}

function handleHelloIntent(request, context) {
    let options = {};
    let name = request.intent.slots.FirstName.value;
    options.speechText = "Hello " + name + ". ";
    options.speechText += getWish();
    getQuote(function (quote, error) {
        if (error) {
            context.fail(error);
        }
        else {
            options.speechText += quote;
            options.endSession = true;
            context.succeed(buildResponse(options));
        }
    });
}

function handleLaunchRequest(context) {
    let options = {};
    options.speechText = "Welcome to Greetings skill. Using our skill you can greet your guests. Whom you want to greet?";
    options.repromptText = "You can say for example, say hello to John.";
    options.endSession = "false";
    context.succeed(buildResponse(options));
}

function handleQuoteIntent(request, context, session){
    let options = {};
    options.session = session;

    getQuote(function (quote, error) {
        if (error) {
            context.fail(error);
        }
        else {
            options.speechText = quote;
            options.speechText += "Do you want to listen one more quote? ";
            options.repromptText = "You can say yes or one more. ";
            options.session.attributes.quoteIntent = true;
            options.endSession = false;
            context.succeed(buildResponse(options));
        }
    });    
}

function handleNextQuoteIntent(request, context, session){
    let options = {};
    options.session = session;

    if(session.attributes.quoteIntent){
        getQuote(function (quote, error) {
            if (error) {
                context.fail(error);
            }
            else {
                options.speechText = quote;
                options.speechText += "Do you want to listen one more quote? ";
                options.repromptText = "You can say yes or one more. ";
                //options.session.attributes.quoteIntent = true;
                options.endSession = false;
                context.succeed(buildResponse(options));                
            }
        });  
    }else{
        options.speechText = "Sorry! It's a wrong invocation of this intent";
        options.endSession = true;
        context.succeed(buildResponse(options));
    }
}

function getWish() {
    var myDate = new Date();
    var hours = myDate.getUTCHours() + 5.30;
    if (hours >24) {
      hours = hours - 24;
    }
  
    if (hours < 12) {
      return "Good Morning. ";
    } else if (hours < 18) {
      return "Good afternoon. ";
    } else {
      return "Good evening. ";
    }  
}

function getQuote(callback){
    var url="http://api.forismatic.com/api/1.0/json?method=getQuote&lang=en&format=json";
    var req = http.get(url, function(res){
        var body ="";

        res.on('data',function(chunk){
            body += chunk;
        });

        res.on('end',function(){
            body = body.replace(/\\/g,'');
            var quote = JSON.parse(body);
            callback(quote.quoteText);
        });
    });

    req.on('error',function(err){
        callback('',err);
    });
}

function buildResponse(options){

    var response = {
        version: "1.0",
        response: {
            outputSpeech:{
                type:"SSML",
                ssml: "<speak>"+options.speechText+"</speak>"
            },
            shouldEndSession: options.endSession
        }
    };

    if(options.repromptText){
        response.response.reprompt = {
            outputSpeech :{
                type : "SSML",
                ssml : "<speak>"+options.repromptText+"</speak>"
            }
        };
    }

    if(options.session && options.session.attributes){
        response.sessionAttributes = options.session.attributes;
    }

    return response;
}
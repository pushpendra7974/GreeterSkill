'use strict'

exports.handler = function(event,context){
    try
    {
        var request = event.request;

        /**
         * Types of Requests:-
         * 1. LaunchRequest
         * 2. IntentRequest
         * 3. SessionEndedRequest 
         **/

        if(request.type === "LaunchRequest"){
            let options ={};
            options.speechText = "Welcome to Greetings skill. Using our skill you can greet your guests. Whom you want to greet?";
            options.repromptText ="You can say for example, say hello to John.";
            options.endSession = "false";

            context.succeed(buildResponse(options));

        }else if(request.type === "IntentRequest"){

            let options ={};
            if(request.intent.name === "HelloIntent"){
                let name = request.intent.slots.FirstName.value;
                options.speechText = "Hello "+ name + ". ";
                options.speechText += getWish();
                options.endSession = true;

                context.succeed(buildResponse(options));
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

function buildResponse(options){

    var response = {
        version: "1.0",
        response: {
            outputSpeech:{
                type:"PlainText",
                text: options.speechText
            },
            shouldEndSession: options.endSession
        }
    };

    if(options.repromptText){
        response.response.reprompt = {
            outputSpeech :{
                type : "PlainText",
                text : options.repromptText
            }
        };
    }

    return response;
}
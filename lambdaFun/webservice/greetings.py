from flask import Flask
from flask import request
from flask import make_response
import json
import datetime
import os

app = Flask(__name__)

@app.route('/')
def Hello():
    return "Hello World"

@app.route('/alexa_end_point',methods=['POST'])
def alexa():
    event = request.get_json()
    req = event['request']

    if req['type']=="LaunchRequest":
        handle_launch_request()
    elif req['type']=="IntentRequest":
        if req['intent']['name'] == 'HelloIntent':
            return handle_hello_intent(req)
        else:
            return "",400
    elif req['type']=="SessionEndedRequest":
        pass

def handle_launch_request():
    'Handles launch request and generates response'
    res = Response()
    res.speech_text ="Welcome to Greetings skill. Using our skill you can greet your guests. Whom you want to greet?"
    res.repromt_text="You can say for example, say hello to John."
    res.end_session = False
    return res.build_response()

def handle_hello_intent(req):
    'Handles hello intent and returns response'
    name = req['intent']['slots']['FirstName']['value']
    res = Response()
    res.speech_text = 'Hello <say-as interpret-as="spell-out">{0}</say-as> {0}. '.format(name)
    res.speech_text += get_wish()
    return res.build_response()

def get_wish():
    'Return Good Morning/Afternoon/Evening depending on time of the day'
    current_time = datetime.datetime.utcnow()
    hours = current_time.hour+5.30

    if hours >24:
        hours = hours-24

    if hours < 12:
        return  'Good morning. ' 
    elif hours < 18:
        return 'Good afternoon. '
    else:
        return 'Good evening. '

class Response(object):
    'Alexa Skill Response object with helper functions'

    def __init__(self):
        self.speech_text = None
        self.repromt_text = None
        self.end_session = True

    def build_response(self):
        'To build Alexa Response and returns'

        fnl_response = {
            'version' : '1.0',
            'response':{
                'type':'SSML',
                'ssml':'<speak>'+ self.speech_text + '</speak>'
            },
            'shouldEndSession' : self.end_session
        }

        if self.repromt_text:
            fnl_response['response']['reprompt_text'] = {
                'outputSpeech':{
                    'type' : 'SSML',
                    'ssml' : '<speak>'+ self.repromt_text + '</speak>'
                }
            }

        http_response = make_response(json.dumps(fnl_response))
        http_response.headers['Content-Type'] = 'application/json'
        
        return http_response

if __name__=="__main__":
    app.run()
    port = int(os.getenv('PORT', 5000))
    print ("Starting app on port %d" % port)
    app.run(debug=False, port=port, host='0.0.0.0')


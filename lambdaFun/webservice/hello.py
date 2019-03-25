from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/alexa_end_point")
def alexa():
    return "Hello Alexa!"

if __name__ == "__main__":
    app.run()
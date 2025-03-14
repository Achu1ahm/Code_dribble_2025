import time
import base64
import io
from flask import Flask, request
from flask_socketio import SocketIO, join_room

from gtts import gTTS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

ROOM_NAME = "interview_room"
conversation_history = [] 
clients = {}  
latest_user_offer = None 
user_sid = None

def text_to_base64_audio(text):
    tts = gTTS(text=text, lang="en", slow=False)
    audio_file = io.BytesIO()
    tts.write_to_fp(audio_file)
    audio_file.seek(0)
    return base64.b64encode(audio_file.read()).decode("utf-8")

def estimate_audio_duration(audio_base64):
    audio_bytes = len(base64.b64decode(audio_base64))
    estimated_duration = (audio_bytes * 8) / 128000  # Assuming 128kbps MP3
    return max(estimated_duration, 3)

@socketio.on("connect")
def handle_connect():
    sid = request.sid
    join_room(ROOM_NAME)
    print(f"Client {sid} connected and joined room: {ROOM_NAME}")
    
    if not any(role == "user" for role in clients.values()):
        print("First client connected, assuming user")
        clients[sid] = "user"
        global user_sid
        user_sid = sid
        bot_message = "Hi, please upload your resume."
        bot_audio = text_to_base64_audio(bot_message)
        socketio.emit("bot-audio", {"audioBase64": bot_audio}, to=sid)
        conversation_history.append({"type": "bot", "audioBase64": bot_audio})
    else:
        clients[sid] = "invigilator"
        print(f"Invigilator {sid} connected")
        # Send history when requested, not immediately
        for event in conversation_history:
            if event["type"] == "bot":
                socketio.emit("bot-audio-listener", {"audioBase64": event["audioBase64"]}, to=sid)
            elif event["type"] == "user":
                socketio.emit("user-audio", {"audioBase64": event["audioBase64"]}, to=sid)
        if latest_user_offer and user_sid in clients:
            print(f"Sending cached user-offer to invigilator {sid}")
            socketio.emit("user-offer", latest_user_offer, to=sid)
        
@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    if sid in clients:
        if clients[sid] == "user":
            global latest_user_offer, user_sid
            latest_user_offer = None
            user_sid = None
        del clients[sid]
    print(f"Client {sid} disconnected")

@socketio.on("user-audio")
def handle_user_audio(data):
    user_audio_base64 = data["base64Audio"]
    print("Received user audio from:", request.sid)
    conversation_history.append({"type": "user", "audioBase64": user_audio_base64})
    socketio.emit("user-audio", {"audioBase64": user_audio_base64}, room=ROOM_NAME)
    socketio.emit("user-audio-listener", {"audioBase64": user_audio_base64}, room=ROOM_NAME)

    bot_response_text = "Thank you, processing your response..."
    bot_audio_base64 = text_to_base64_audio(bot_response_text)
    socketio.emit("bot-audio", {"audioBase64": bot_audio_base64}, room=ROOM_NAME)
    conversation_history.append({"type": "bot", "audioBase64": bot_audio_base64})

    user_audio_duration = estimate_audio_duration(bot_audio_base64)
    time.sleep(user_audio_duration)
    socketio.emit("bot-audio-listener", {"audioBase64": bot_audio_base64}, room=ROOM_NAME)

    time.sleep(3)
    bot_followup_text = "Now, please introduce yourself."
    bot_followup_audio = text_to_base64_audio(bot_followup_text)
    socketio.emit("bot-audio", {"audioBase64": bot_followup_audio}, room=ROOM_NAME)
    socketio.emit("bot-audio-listener", {"audioBase64": bot_followup_audio}, room=ROOM_NAME)
    conversation_history.append({"type": "bot", "audioBase64": bot_followup_audio})

@socketio.on("user-offer")
def handle_user_offer(offer):
    global latest_user_offer
    print("User sent WebRTC offer from:", request.sid)
    latest_user_offer = offer
    socketio.emit("user-offer", offer, room=ROOM_NAME)

@socketio.on("invigilator-answer")
def handle_invigilator_answer(answer):
    print("Invigilator sent WebRTC answer from:", request.sid)
    socketio.emit("invigilator-answer", answer, room=ROOM_NAME)

@socketio.on("request-offer")
def handle_request_offer():
    sid = request.sid
    if latest_user_offer and user_sid in clients:
        print(f"Invigilator {sid} requested user-offer, sending cached offer")
        socketio.emit("user-offer", latest_user_offer, to=sid)

if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
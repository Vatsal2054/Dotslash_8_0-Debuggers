from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
import os
from pymongo import MongoClient
from bson import ObjectId
import json
import logging

# Basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

if not mongo_uri:
    raise ValueError("MONGO_URI environment variable is not set")

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.json_encoder = MongoJSONEncoder

# MongoDB setup with error handling
try:
    # Connect to MongoDB Atlas
    db_client = MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=6000,
        retryWrites=True,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    
    # Test connection
    db_client.server_info()
    logger.info("MongoDB Atlas connection successful!")
    
    db = db_client.get_database()
    doctors_collection = db["doctors"]
    users_collection = db["users"]
    
except Exception as e:
    logger.error(f"MongoDB connection error: {str(e)}")
    raise

# Initialize the model with optimized settings
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    google_api_key=api_key,
    temperature=0.3,
    timeout=2,
    max_retries=1
)

SPECIALIZATIONS = {
    "Orthopaedic": {
        "keywords": ["bone", "joint", "muscle", "fracture"],
        "description": "Musculoskeletal conditions and injuries"
    },
    "Dermatologists": {
        "keywords": ["skin", "acne", "rash"],
        "description": "Skin conditions"
    },
    "Neurologist": {
        "keywords": ["headache", "brain", "nerve"],
        "description": "Brain and nerve disorders"
    },
    "Cardiologist": {
        "keywords": ["heart", "chest", "blood pressure"],
        "description": "Heart conditions"
    },
    "Pediatrician": {
        "keywords": ["child", "baby", "infant"],
        "description": "Children's health"
    },
    "Psychiatrist": {
        "keywords": ["anxiety", "depression", "mental"],
        "description": "Mental health"
    },
    "General Medicine": {
        "keywords": ["fever", "cold", "cough"],
        "description": "General health"
    }
}

def find_best_specialty(symptoms):
    symptoms_lower = symptoms.lower()
    for specialty, info in SPECIALIZATIONS.items():
        for keyword in info["keywords"]:
            if keyword in symptoms_lower:
                return specialty
    return "General Medicine"

def get_doctors_for_specialty(specialty):
    try:
        # Find doctors with the given specialty
        doctor_cursor = doctors_collection.find(
            {"specialization": specialty, "isAvailable": True},
            {"userId": 1, "degree": 1, "experience": 1}
        ).limit(5)
        
        doctors = []
        for doctor in doctor_cursor:
            # Get corresponding user details
            user = users_collection.find_one(
                {"_id": doctor.get("userId")},
                {"firstName": 1, "lastName": 1, "address.city": 1}
            )
            
            if user:
                doctors.append({
                    "doctorId": str(doctor["_id"]),
                    "name": f"{user.get('firstName', '')} {user.get('lastName', '')}",
                    "degree": doctor.get("degree", ""),
                    "experience": doctor.get("experience", ""),
                    "location": user.get("address", {}).get("city", "")
                })
        
        return doctors
    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return []

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", "")
        
        if not symptoms:
            return jsonify({"error": "Symptoms are required."}), 400

        specialty = find_best_specialty(symptoms)
        
        if specialty == "General Medicine":
            try:
                prompt = ChatPromptTemplate.from_messages([
                    ("system", "You are a healthcare assistant. Provide only the specialist name."),
                    ("human", f"Based on these symptoms: {symptoms}, identify the most appropriate medical specialist from this list: {list(SPECIALIZATIONS.keys())}. Respond with just the specialist name.")
                ])
                
                chain = prompt | llm | StrOutputParser()
                llm_response = chain.invoke({})
                
                if any(spec.lower() in llm_response.lower() for spec in SPECIALIZATIONS):
                    specialty = next(
                        spec for spec in SPECIALIZATIONS 
                        if spec.lower() in llm_response.lower()
                    )
            except Exception as e:
                logger.error(f"LLM error: {str(e)}")

        doctors = get_doctors_for_specialty(specialty)
        
        response = {
            "recommended_specialty": specialty,
            "specialty_focus": SPECIALIZATIONS[specialty]["description"],
            "available_doctors": doctors
        }
        return jsonify(response)
            
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
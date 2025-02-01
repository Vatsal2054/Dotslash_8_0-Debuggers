from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
import PyPDF2
import os
import json
import re
import logging
from typing import Dict, Any, Optional
from pymongo import MongoClient
from bson import ObjectId

# Basic logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super().default(obj)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.json_encoder = MongoJSONEncoder

# MongoDB setup
try:
    db_client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=6000,
        retryWrites=True,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db_client.server_info()
    logger.info("MongoDB Atlas connection successful!")
    db = db_client.get_database()
    doctors_collection = db["doctors"]
    users_collection = db["users"]
except Exception as e:
    logger.error(f"MongoDB connection error: {str(e)}")
    raise

# Initialize Gemini models
genai.configure(api_key=GEMINI_API_KEY)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    google_api_key=GEMINI_API_KEY,
    temperature=0.3,
    timeout=2,
    max_retries=1
)

class MedicalSystem:
    SPECIALIZATIONS = {
        "Cardiologist": {
            "keywords": ["heart", "chest", "blood pressure"],
            "description": "Heart and cardiovascular system specialist"
        },
        "Dermatologist": {
            "keywords": ["skin", "acne", "rash"],
            "description": "Skin, hair, and nail conditions specialist"
        },
        "Pediatrician": {
            "keywords": ["child", "infant", "pediatric"],
            "description": "Children's health specialist"
        },
        "Neurologist": {
            "keywords": ["brain", "headache", "nerve"],
            "description": "Brain, spinal cord, and nervous system specialist"
        },
        "Orthopaedic": {
            "keywords": ["bone", "joint", "muscle", "fracture"],
            "description": "Bone and joint specialist"
        },
        "Psychiatrist": {
            "keywords": ["anxiety", "depression", "mental"],
            "description": "Mental health specialist"
        },
        "General Medicine": {
            "keywords": ["fever", "cold", "cough"],
            "description": "Primary care and general health conditions"
        }
    }

    def __init__(self):
        self.model = genai.GenerativeModel("gemini-pro")

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """Extract text from PDF file."""
        text = []
        try:
            with open(pdf_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text.append(page_text)
            return ' '.join(text)
        except Exception as e:
            raise Exception(f"Error reading PDF: {str(e)}")

    @staticmethod
    def clean_json_response(response_text: str) -> Dict[str, Any]:
        """Clean and parse JSON response."""
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
        return {"error": "Failed to parse AI response", "raw_response": response_text}

    def analyze_medical_report(self, text: str) -> Dict[str, Any]:
        """Analyze medical report and get recommendations."""
        # [Previous analyze_medical_report implementation remains unchanged]
        # ... [Keep the existing implementation]

    def get_precautions_and_recommendations(self, symptoms: str) -> Dict[str, Any]:
        """Generate precautions and recommendations based on symptoms using Gemini."""
        prompt = f"""
        Analyze these symptoms and provide detailed precautions and recommendations in JSON format:

        Required JSON structure:
        {{
            "initial_assessment": {{
                "severity": "mild/moderate/severe",
                "immediate_action_required": true/false,
                "seek_emergency": true/false
            }},
            "precautions": [
                {{
                    "category": "category name",
                    "measures": ["detailed precautionary measures"],
                    "priority": "high/medium/low"
                }}
            ],
            "lifestyle_recommendations": [
                {{
                    "area": "area of focus",
                    "suggestions": ["specific actionable suggestions"],
                    "duration": "temporary/long-term"
                }}
            ],
            "home_remedies": [
                {{
                    "remedy": "remedy name",
                    "instructions": "how to apply/use",
                    "caution": "any warnings or contraindications"
                }}
            ],
            "when_to_seek_emergency": ["list of warning signs that require immediate medical attention"]
        }}

        Symptoms:
        {symptoms}

        Ensure the response is ONLY the JSON object with no additional text.
        """

        try:
            response = self.model.generate_content(prompt)
            return self.clean_json_response(response.text)
        except Exception as e:
            return {"error": f"Precautions generation failed: {str(e)}"}

    @staticmethod
    def find_best_specialty(symptoms: str) -> str:
        """Find best matching specialty based on symptoms."""
        symptoms_lower = symptoms.lower()
        for specialty, info in MedicalSystem.SPECIALIZATIONS.items():
            for keyword in info["keywords"]:
                if keyword in symptoms_lower:
                    return specialty
        return "General Medicine"

    @staticmethod
    def get_doctors_for_specialty(specialty: str) -> list:
        """Get available doctors for a specialty."""
        try:
            doctor_cursor = doctors_collection.find(
                {"specialization": specialty, "isAvailable": True},
                {"userId": 1, "degree": 1, "experience": 1}
            ).limit(5)
            
            doctors = []
            for doctor in doctor_cursor:
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

# API Routes
@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle medical report analysis."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Invalid or no file selected"}), 400
    
    medical_system = MedicalSystem()
    pdf_path = f"temp_{file.filename}"
    
    try:
        file.save(pdf_path)
        text = medical_system.extract_text_from_pdf(pdf_path)
        result = medical_system.analyze_medical_report(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@app.route("/recommend", methods=["POST"])
def recommend():
    """Handle symptom-based doctor recommendations with dynamic precautions."""
    try:
        data = request.get_json()
        symptoms = data.get("symptoms", "")
        
        if not symptoms:
            return jsonify({"error": "Symptoms are required."}), 400

        medical_system = MedicalSystem()
        
        # Get specialty and doctors
        specialty = medical_system.find_best_specialty(symptoms)
        doctors = medical_system.get_doctors_for_specialty(specialty)
        
        # Get dynamic precautions and recommendations
        precautions_data = medical_system.get_precautions_and_recommendations(symptoms)
        
        response = {
            "recommended_specialty": specialty,
            "specialty_description": medical_system.SPECIALIZATIONS[specialty]["description"],
            "available_doctors": doctors,
            "precautions_and_recommendations": precautions_data
        }
        
        return jsonify(response)
            
    except Exception as e:
        logger.error(f"Request error: {str(e)}")
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
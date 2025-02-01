from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
import json
import os
from pymongo import MongoClient

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
mongo_uri = os.getenv("MONGO_URI")

# MongoDB setup
db_client = MongoClient(mongo_uri)
db = db_client["test"]
doctors_collection = db["doctors"]
users_collection = db["users"]

# Initialize the model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=api_key)

# Specialization mapping with keywords and descriptions
SPECIALIZATIONS = {
    "Orthopaedic": {
        "keywords": ["bone", "joint", "muscle", "fracture", "sprain", "arthritis", "back pain"],
        "description": "Musculoskeletal conditions and injuries"
    },
    "Dermtologists": {
        "keywords": ["skin", "acne", "rash", "eczema", "dermatitis", "moles", "skin infection"],
        "description": "Skin, hair, and nail conditions"
    },
    "Neurologist": {
        "keywords": ["headache", "migraine", "seizure", "nerve", "brain", "dizziness", "numbness"],
        "description": "Brain, spine, and nervous system disorders"
    },
    "Cardiologist": {
        "keywords": ["heart", "chest pain", "palpitations", "blood pressure", "cardiovascular"],
        "description": "Heart and cardiovascular conditions"
    },
    "Pediatrician": {
        "keywords": ["child", "children", "infant", "baby", "pediatric", "childhood"],
        "description": "Children's health and development"
    },
    "Psychiatrist ": {
        "keywords": ["anxiety", "depression", "mental", "mood", "stress", "sleep", "psychiatric"],
        "description": "Mental health and behavioral conditions"
    },
    "General Medicine": {
        "keywords": ["fever", "cold", "flu", "cough", "general", "fatigue", "common"],
        "description": "General health conditions and primary care"
    }
}

# Create the symptom analysis chain
symptom_prompt = """You are a healthcare assistant. Based on these symptoms: {symptoms}, 
identify the most appropriate medical specialist from this list only:
- Orthopaedics
- Dermtologists
- Neurologist
- Cardiologist
- Pediatrician
- Psychiatrist 
- General Medicine

Respond in this format:
Specialist: [specialty name from the list above]
Reason: [brief explanation]
Please keep the response concise and direct."""

symptom_chain = (
    ChatPromptTemplate.from_messages([
        ("system", "You are a healthcare assistant. Provide concise, focused responses."),
        ("human", symptom_prompt)
    ])
    | llm
    | StrOutputParser()
)

def find_best_specialty(symptoms, llm_response):
    """
    Find the most appropriate specialty based on both symptoms and LLM response.
    Returns tuple of (specialty, confidence_score, matched_keywords)
    """
    symptoms_lower = symptoms.lower()
    llm_response_lower = llm_response.lower()
    
    best_match = {
        "specialty": None,
        "score": 0,
        "keywords": []
    }
    
    for specialty, info in SPECIALIZATIONS.items():
        score = 0
        matched_keywords = []
        
        # Check keywords in original symptoms
        for keyword in info["keywords"]:
            if keyword.lower() in symptoms_lower:
                score += 2
                matched_keywords.append(keyword)
        
        # Check keywords in LLM response
        for keyword in info["keywords"]:
            if keyword.lower() in llm_response_lower:
                score += 1
                if keyword not in matched_keywords:
                    matched_keywords.append(keyword)
        
        # Check if specialty name is mentioned in LLM response
        if specialty.lower() in llm_response_lower:
            score += 3
        
        if score > best_match["score"]:
            best_match = {
                "specialty": specialty,
                "score": score,
                "keywords": matched_keywords
            }
    
    # Default to General Medicine if no good match found
    if best_match["score"] == 0:
        return "General Medicine", 0, []
    
    return best_match["specialty"], best_match["score"], best_match["keywords"]

def get_doctors_for_specialty(specialty):
    """Fetch available doctors with their user information for the recommended specialty."""
    try:
        # Find doctors with the given specialization
        available_doctors = list(doctors_collection.aggregate([
            {
                "$match": {
                    "specialization": specialty,
                    "isAvailable": True
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "user"
                }
            },
            {
                "$unwind": "$user"
            },
            {
                "$match": {
                    "user.role": "doctor"
                }
            },
            {
                "$project": {
                    "degree": 1,
                    "experience": 1,
                    "workingPlace": 1,
                    "firstName": "$user.firstName",
                    "lastName": "$user.lastName",
                    "city": "$user.address.city",
                    "state": "$user.address.state"
                }
            }
        ]))
        
        if not available_doctors:
            return f"No doctors currently available for {specialty}. Please try again later or contact our help desk."
        
        doctor_list = []
        for doctor in available_doctors:
            doctor_info = (
                f"Dr. {doctor.get('firstName', '')} {doctor.get('lastName', '')} "
                f"({doctor.get('degree', 'MD')})\n"
                f"Experience: {doctor.get('experience', 0)} years\n"
                f"Location: {doctor.get('city', '')}, {doctor.get('state', '')}\n"
                f"Working at: {doctor.get('workingPlace', '')}\n"
            )
            doctor_list.append(doctor_info)
        
        return "\n".join(doctor_list)
    except Exception as e:
        return f"Error retrieving doctor information: {str(e)}"

def get_response(symptoms):
    """Process symptoms and return structured response with confidence levels"""
    try:
        # Get LLM analysis
        llm_response = symptom_chain.invoke({"symptoms": symptoms})
        
        # Find best specialty match
        specialty, confidence_score, matched_keywords = find_best_specialty(symptoms, llm_response)
        
        # Get available doctors
        doctors = get_doctors_for_specialty(specialty)
        
        # Create detailed response
        response = (
            f"Analysis:\n{llm_response}\n\n"
            f"Recommended Specialty: {specialty}\n"
            f"Specialty Focus: {SPECIALIZATIONS[specialty]['description']}\n"
        )
        
        if matched_keywords:
            response += f"Matched Symptoms: {', '.join(matched_keywords)}\n"
        
        response += f"\nAvailable Doctors:\n{doctors}"
        
        return response
        
    except Exception as e:
        return f"An error occurred: {str(e)}"

if __name__ == "__main__":
    while True:
        symptoms_input = input("\nDescribe your symptoms (or type 'exit' to quit): ")
        if symptoms_input.lower() == 'exit':
            break
        response = get_response(symptoms_input)
        print("\n" + response)
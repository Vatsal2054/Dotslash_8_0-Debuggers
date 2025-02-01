import google.generativeai as genai
import PyPDF2
import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, Any, Optional

app = Flask(__name__)
CORS(app)

# Configure Google GenAI
genai.configure(api_key="AIzaSyD_GXtgGI-vLVLspVtn5wBmdE3MnkrNYJU")

lass MedicalSystem:
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
        "Orthopedist": {
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
        """Extract and clean text from a PDF file."""
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
        """Extract and parse JSON from AI response."""
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
        return {
            "error": "Failed to parse AI response",
            "raw_response": response_text
        }

    def analyze_medical_report(self, text: str) -> Dict[str, Any]:
        """Analyze medical report using Google's Gemini Pro model."""
        prompt = f"""
        Analyze this medical report as a specialized medical AI. Provide a detailed analysis in JSON format:

        Guidelines:
        1. Extract ALL symptoms mentioned, even mild ones
        2. List ALL possible diseases that match the symptoms
        3. Consider test results and vital signs if present
        4. Recommend specialists based on symptoms and possible conditions
        5. Provide a comprehensive summary of the findings
        6. Include severity assessment of the overall condition

        Required JSON structure:
        {{
            "summary": {{
                "overview": "Brief overview of the case how diagnostic it and need to be reviewed by a specialist",
                "severity_assessment": "mild/moderate/severe",
                "key_findings": ["list of important findings"],
                "urgent_attention": "yes/no",
                "follow_up_timeline": "immediate/within week/routine"
            }},
            "symptoms": [
                {{
                    "symptom": "detailed symptom",
                    "severity": "mild/moderate/severe",
                    "duration": "duration if mentioned",
                    "related_conditions": ["possible related conditions"]
                }}
            ],
            "possible_diseases": [
                {{
                    "disease": "disease name",
                    "confidence": "high/medium/low",
                    "reasoning": "brief explanation",
                    "common_complications": ["possible complications"]
                }}
            ],
            "recommended_doctor": {{
                "primary": {{
                    "specialist": "main specialist needed",
                    "specialty_area": "specific area of expertise",
                    "urgency": "immediate/soon/routine"
                }},
                "secondary": {{
                    "specialist": "additional specialist if needed",
                    "specialty_area": "specific area of expertise",
                    "urgency": "immediate/soon/routine"
                }},
                "reasoning": "explanation for specialist choices"
            }},
            "precautions": [
                {{
                    "precaution": "specific precaution",
                    "importance": "critical/important/recommended",
                    "duration": "how long to follow",
                    "details": "additional details"
                }}
            ],
            "additional_tests": [
                {{
                    "test": "test name",
                    "purpose": "why it's needed",
                    "urgency": "immediate/soon/routine"
                }}
            ],
            "lifestyle_recommendations": [
                {{
                    "category": "diet/exercise/sleep/etc",
                    "recommendation": "specific advice",
                    "importance": "high/medium/low"
                }}
            ]
        }}

        Medical Report:
        {text}

        Ensure the response is ONLY the JSON object with no additional text.
        """

        try:
            response = self.model.generate_content(prompt)
            result = self.clean_json_response(response.text)
            
            # Validate and provide defaults for missing fields
            default_response = {
                "summary": {
                    "overview": "Unable to generate summary due to insufficient information",
                    "severity_assessment": "unknown",
                    "key_findings": ["No significant findings detected"],
                    "urgent_attention": "unknown",
                    "follow_up_timeline": "routine"
                },
                "symptoms": [{"symptom": "No symptoms detected", "severity": "unknown", "duration": "unknown", "related_conditions": []}],
                "possible_diseases": [{"disease": "Unable to determine", "confidence": "low", "reasoning": "Insufficient information", "common_complications": []}],
                "recommended_doctor": {
                    "primary": {
                        "specialist": "General Medicine",
                        "specialty_area": "General health assessment",
                        "urgency": "routine"
                    },
                    "secondary": None,
                    "reasoning": "Default recommendation due to insufficient information"
                },
                "precautions": [{"precaution": "Consult a healthcare provider", "importance": "critical", "duration": "until medical consultation", "details": "Seek professional medical advice"}],
                "additional_tests": [{"test": "General health assessment", "purpose": "Baseline health evaluation", "urgency": "routine"}],
                "lifestyle_recommendations": [{"category": "general", "recommendation": "Maintain healthy lifestyle", "importance": "high"}]
            }
            
            # Merge with defaults for any missing fields
            for key in default_response:
                if key not in result or not result[key]:
                    result[key] = default_response[key]

            # Add specialization details
            if "recommended_doctor" in result:
                primary_specialist = result["recommended_doctor"]["primary"]["specialist"]
                if primary_specialist in self.SPECIALIZATIONS:
                    result["recommended_doctor"]["primary"]["specialty_description"] = self.SPECIALIZATIONS[primary_specialist]
                
                if result["recommended_doctor"]["secondary"]:
                    secondary_specialist = result["recommended_doctor"]["secondary"]["specialist"]
                    if secondary_specialist in self.SPECIALIZATIONS:
                        result["recommended_doctor"]["secondary"]["specialty_description"] = self.SPECIALIZATIONS[secondary_specialist]
                    
            return result
        except Exception as e:
            return {
                "error": f"Analysis failed: {str(e)}",
                "raw_response": None
            }

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle medical report analysis requests."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Invalid or no file selected"}), 400
    
    analyzer = MedicalReportAnalyzer()
    pdf_path = f"temp_{file.filename}"
    
    try:
        file.save(pdf_path)
        text = analyzer.extract_text_from_pdf(pdf_path)
        result = analyzer.analyze_medical_report(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

if __name__ == '__main__':
    app.run(port=8080, debug=True)
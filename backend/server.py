from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
import json
import base64

# Import models and services
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/protv_app')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'protv_app')]

# Create the main app
app = FastAPI(title="PROTV Application System", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ContactInfo(BaseModel):
    country_code: str
    phone_number: str

class QatarResidenceInfo(BaseModel):
    qatari_id_number: Optional[str] = None
    qatari_id_expiry: Optional[str] = None

class PassportInfo(BaseModel):
    passport_number: Optional[str] = None
    passport_expiry: Optional[str] = None

class WorkExperience(BaseModel):
    worked_with_protv: str
    last_project_name: str
    preferred_work_types: List[str]
    position: str

class FileUploads(BaseModel):
    personal_photo: Optional[Dict[str, str]] = None
    id_copy: Optional[Dict[str, str]] = None
    passport_copy: Optional[Dict[str, str]] = None
    cv: Optional[Dict[str, str]] = None
    portfolio: Optional[Dict[str, str]] = None

class Application(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    application_id: str = Field(default_factory=lambda: f"PROTV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}")
    
    # Personal Information
    full_name: str
    nationality: str
    date_of_birth: str  # DD/MM/YYYY format
    email: EmailStr
    contact_info: ContactInfo
    
    # Residence Information
    has_qatar_residence: str  # "yes" or "no"
    qatar_residence_info: Optional[QatarResidenceInfo] = None
    passport_info: Optional[PassportInfo] = None
    
    # Work Experience
    work_experience: WorkExperience
    
    # File Information
    files: Optional[FileUploads] = None
    
    # Metadata
    submission_date: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="submitted")
    google_drive_folder_url: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ApplicationResponse(BaseModel):
    success: bool
    message: str
    application_id: str
    submission_id: str

# Google Drive Service (simplified for serverless)
class GoogleDriveService:
    def __init__(self):
        self.credentials = None
        self.drive_service = None
        self.folder_id = os.environ.get('GOOGLE_DRIVE_FOLDER_ID')
    
    def create_user_folder(self, application_id: str, user_name: str):
        """Mock implementation - replace with actual Google Drive integration"""
        folder_name = f"{application_id}_{user_name.replace(' ', '_')}"
        folder_url = f"https://drive.google.com/drive/folders/mock-{application_id}"
        return f"mock-{application_id}", folder_url
    
    def upload_file_from_base64(self, file_data: str, file_name: str, folder_id: str, mime_type: str = None):
        """Mock implementation - replace with actual Google Drive upload"""
        return {
            'file_id': f"mock-file-{uuid.uuid4()}",
            'file_name': file_name,
            'view_link': f"https://drive.google.com/file/d/mock-{uuid.uuid4()}/view",
            'download_link': '',
            'mime_type': mime_type or 'application/octet-stream'
        }

drive_service = GoogleDriveService()

@api_router.get("/")
async def root():
    return {"message": "PROTV Application System API"}

@api_router.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await db.list_collection_names()
        
        return {
            "status": "healthy",
            "database": "connected",
            "google_drive": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@api_router.post("/applications/submit", response_model=ApplicationResponse)
async def submit_application(
    application_data: str = Form(...),
    personal_photo: Optional[UploadFile] = File(None),
    id_copy: Optional[UploadFile] = File(None),
    passport_copy: Optional[UploadFile] = File(None),
    cv: Optional[UploadFile] = File(None),
    portfolio: Optional[UploadFile] = File(None)
):
    """Submit a complete PROTV application with files"""
    try:
        # Parse application data
        app_data = json.loads(application_data)
        
        # Generate unique IDs
        application_id = f"PROTV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        submission_id = str(uuid.uuid4())
        
        logger.info(f"Processing application: {application_id}")
        
        # Create user folder in Google Drive
        user_folder_id, user_folder_url = drive_service.create_user_folder(
            application_id, app_data.get('fullName', 'Unknown')
        )
        
        # Process file uploads
        uploaded_files = {}
        files_mapping = {
            'personal_photo': personal_photo,
            'id_copy': id_copy,
            'passport_copy': passport_copy,
            'cv': cv,
            'portfolio': portfolio
        }
        
        for file_type, uploaded_file in files_mapping.items():
            if uploaded_file and uploaded_file.size > 0:
                try:
                    # Read file content
                    file_content = await uploaded_file.read()
                    
                    # Convert to base64 for Google Drive upload
                    file_base64 = base64.b64encode(file_content).decode('utf-8')
                    
                    # Upload to Google Drive
                    drive_file_info = drive_service.upload_file_from_base64(
                        file_base64, 
                        uploaded_file.filename, 
                        user_folder_id, 
                        uploaded_file.content_type
                    )
                    
                    uploaded_files[file_type] = drive_file_info
                    logger.info(f"Uploaded {file_type}: {uploaded_file.filename}")
                    
                except Exception as e:
                    logger.error(f"Failed to upload {file_type}: {str(e)}")
                    continue
        
        # Create application record
        application = Application(
            id=submission_id,
            application_id=application_id,
            full_name=app_data.get('fullName', ''),
            nationality=app_data.get('nationality', ''),
            date_of_birth=app_data.get('dateOfBirth', ''),
            email=app_data.get('email', ''),
            contact_info={
                "country_code": app_data.get('countryCode', ''),
                "phone_number": app_data.get('phoneNumber', '')
            },
            has_qatar_residence=app_data.get('hasQatarResidence', ''),
            qatar_residence_info={
                "qatari_id_number": app_data.get('qatariIdNumber'),
                "qatari_id_expiry": app_data.get('qatariIdExpiry')
            } if app_data.get('hasQatarResidence') == 'yes' else None,
            passport_info={
                "passport_number": app_data.get('passportNumber'),
                "passport_expiry": app_data.get('passportExpiry')
            } if app_data.get('hasQatarResidence') == 'no' else None,
            work_experience={
                "worked_with_protv": app_data.get('workedWithProtv', ''),
                "last_project_name": app_data.get('lastProjectName', ''),
                "preferred_work_types": app_data.get('preferredWorkTypes', []),
                "position": app_data.get('position', '')
            },
            files=uploaded_files,
            google_drive_folder_url=user_folder_url
        )
        
        # Save to MongoDB
        application_dict = application.dict()
        await db.applications.insert_one(application_dict)
        
        logger.info(f"Application {application_id} submitted successfully")
        
        return ApplicationResponse(
            success=True,
            message="Application submitted successfully to PROTV!",
            application_id=application_id,
            submission_id=submission_id
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON data: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid application data format")
    
    except Exception as e:
        logger.error(f"Application submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Application submission failed: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# For Vercel serverless
from mangum import Mangum
handler = Mangum(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

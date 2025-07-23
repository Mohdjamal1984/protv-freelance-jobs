from mangum import Mangum
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app
from server import app

# Wrap FastAPI app for Vercel serverless deployment
handler = Mangum(app)

# Export handler for Vercel
def handler_func(event, context):
    return handler(event, context)

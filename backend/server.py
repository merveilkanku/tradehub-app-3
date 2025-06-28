from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from supabase import create_client, Client
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise Exception("Supabase credentials not found")
    try:
        return create_client(url, key)
    except TypeError as e:
        if "unexpected keyword argument 'proxy'" in str(e):
            # Handle proxy error by setting environment variables
            os.environ['HTTP_PROXY'] = ''
            os.environ['HTTPS_PROXY'] = ''
            # Try again without proxy
            return create_client(url, key)
        raise e

# Create the main app
app = FastAPI(title="TradHub API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    country: str
    city: str
    address: str
    user_type: str = "user"  # "user" or "supplier"

class UserLogin(BaseModel):
    identifier: str  # email, phone or username
    password: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_base64: Optional[str] = None
    stock_quantity: int = 1

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_base64: Optional[str] = None
    stock_quantity: Optional[int] = None

class MessageCreate(BaseModel):
    recipient_id: str
    content: str
    product_id: Optional[str] = None

class CommentCreate(BaseModel):
    product_id: str
    content: str

# Helper function to get current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        supabase = get_supabase()
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return user.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Authentication Endpoints
@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    try:
        supabase = get_supabase()
        
        # Create user in Supabase Auth
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name,
                    "phone": user_data.phone,
                    "country": user_data.country,
                    "city": user_data.city,
                    "address": user_data.address,
                    "user_type": user_data.user_type
                }
            }
        })
        
        if response.user:
            # Create profile in our custom table - using existing column names
            profile_data = {
                "id": response.user.id,
                "username": user_data.email,  # Use existing username column
                "first_name": user_data.full_name.split()[0] if user_data.full_name else "",
                "last_name": " ".join(user_data.full_name.split()[1:]) if len(user_data.full_name.split()) > 1 else "",
                "phone": user_data.phone,
                "country": user_data.country,
                "city": user_data.city,
                "address": user_data.address,
                "user_type": user_data.user_type,
                "avatar_url": None  # Use existing avatar_url column
            }
            
            supabase.table("profiles").insert(profile_data).execute()
        
        return {
            "message": "User created successfully", 
            "user": response.user,
            "requires_verification": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/auth/signin")
async def signin(login_data: UserLogin):
    try:
        supabase = get_supabase()
        
        # Try to sign in with email first
        response = supabase.auth.sign_in_with_password({
            "email": login_data.identifier,
            "password": login_data.password
        })
        
        if response.session:
            # Get user profile
            profile_response = supabase.table("profiles").select("*").eq("id", response.user.id).execute()
            profile = profile_response.data[0] if profile_response.data else None
            
            return {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "user": response.user,
                "profile": profile
            }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid credentials")

@api_router.post("/auth/signout")
async def signout(current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        supabase.auth.sign_out()
        return {"message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Profile Endpoints
@api_router.get("/profile")
async def get_profile(current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        response = supabase.table("profiles").select("*").eq("id", current_user.id).execute()
        if response.data:
            return response.data[0]
        return {"id": current_user.id, "email": current_user.email}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/profile")
async def update_profile(profile_data: dict, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        update_data = {k: v for k, v in profile_data.items() if v is not None}
        response = supabase.table("profiles").update(update_data).eq("id", current_user.id).execute()
        return response.data[0] if response.data else {"message": "Profile updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Product Endpoints
@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    try:
        supabase = get_supabase()
        query = supabase.table("products").select("""
            *,
            profiles:supplier_id (username, first_name, last_name, country, city, avatar_url)
        """)
        
        if category:
            query = query.eq("category", category)
        if country:
            query = query.eq("supplier_country", country)
        if city:
            query = query.eq("supplier_city", city)
        if search:
            query = query.ilike("name", f"%{search}%")
            
        response = query.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
        return {"products": response.data, "count": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    try:
        supabase = get_supabase()
        response = supabase.table("products").select("""
            *,
            profiles:supplier_id (full_name, country, city, avatar_base64)
        """).eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Get comments for this product
        comments_response = supabase.table("comments").select("""
            *,
            profiles:user_id (full_name, avatar_base64)
        """).eq("product_id", product_id).order("created_at", desc=True).execute()
        
        product = response.data[0]
        product["comments"] = comments_response.data
        
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/products")
async def create_product(product: ProductCreate, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        
        # Check if user is a verified supplier
        profile_response = supabase.table("profiles").select("user_type, is_supplier_verified").eq("id", current_user.id).execute()
        profile = profile_response.data[0] if profile_response.data else None
        
        if not profile or profile["user_type"] != "supplier":
            raise HTTPException(status_code=403, detail="Only suppliers can create products")
        
        # Get supplier location for product
        supplier_profile = supabase.table("profiles").select("country, city").eq("id", current_user.id).execute()
        supplier_location = supplier_profile.data[0] if supplier_profile.data else {}
        
        product_data = {
            **product.dict(),
            "id": str(uuid.uuid4()),
            "supplier_id": current_user.id,
            "supplier_country": supplier_location.get("country"),
            "supplier_city": supplier_location.get("city"),
            "likes_count": 0,
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("products").insert(product_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        
        # Check if user owns the product
        existing = supabase.table("products").select("supplier_id").eq("id", product_id).execute()
        if not existing.data or existing.data[0]["supplier_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this product")
        
        update_data = {k: v for k, v in product.dict().items() if v is not None}
        response = supabase.table("products").update(update_data).eq("id", product_id).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        
        # Check if user owns the product
        existing = supabase.table("products").select("supplier_id").eq("id", product_id).execute()
        if not existing.data or existing.data[0]["supplier_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this product")
        
        supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Like/Unlike Product
@api_router.post("/products/{product_id}/like")
async def toggle_like(product_id: str, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        
        # Check if already liked
        existing_like = supabase.table("product_likes").select("*").eq("product_id", product_id).eq("user_id", current_user.id).execute()
        
        if existing_like.data:
            # Unlike
            supabase.table("product_likes").delete().eq("product_id", product_id).eq("user_id", current_user.id).execute()
            # Decrease like count
            product = supabase.table("products").select("likes_count").eq("id", product_id).execute()
            new_count = max(0, product.data[0]["likes_count"] - 1)
            supabase.table("products").update({"likes_count": new_count}).eq("id", product_id).execute()
            return {"message": "Product unliked", "liked": False}
        else:
            # Like
            supabase.table("product_likes").insert({"product_id": product_id, "user_id": current_user.id}).execute()
            # Increase like count
            product = supabase.table("products").select("likes_count").eq("id", product_id).execute()
            new_count = product.data[0]["likes_count"] + 1
            supabase.table("products").update({"likes_count": new_count}).eq("id", product_id).execute()
            return {"message": "Product liked", "liked": True}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Comments
@api_router.post("/comments")
async def create_comment(comment: CommentCreate, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        comment_data = {
            **comment.dict(),
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "created_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("comments").insert(comment_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Messages/Chat
@api_router.get("/messages")
async def get_conversations(current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        # Get all conversations for current user
        response = supabase.table("messages").select("""
            *,
            sender:sender_id (full_name, avatar_base64),
            recipient:recipient_id (full_name, avatar_base64)
        """).or_(f"sender_id.eq.{current_user.id},recipient_id.eq.{current_user.id}").order("created_at", desc=True).execute()
        
        # Group by conversation
        conversations = {}
        for message in response.data:
            other_user_id = message["recipient_id"] if message["sender_id"] == current_user.id else message["sender_id"]
            if other_user_id not in conversations:
                conversations[other_user_id] = {
                    "user_id": other_user_id,
                    "user_name": message["recipient"]["full_name"] if message["sender_id"] == current_user.id else message["sender"]["full_name"],
                    "last_message": message["content"],
                    "last_message_time": message["created_at"],
                    "messages": []
                }
            conversations[other_user_id]["messages"].append(message)
        
        return list(conversations.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/messages/{other_user_id}")
async def get_conversation_messages(other_user_id: str, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        response = supabase.table("messages").select("""
            *,
            sender:sender_id (full_name, avatar_base64),
            recipient:recipient_id (full_name, avatar_base64)
        """).or_(
            f"and(sender_id.eq.{current_user.id},recipient_id.eq.{other_user_id}),and(sender_id.eq.{other_user_id},recipient_id.eq.{current_user.id})"
        ).order("created_at", asc=True).execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/messages")
async def send_message(message: MessageCreate, current_user=Depends(get_current_user)):
    try:
        supabase = get_supabase()
        message_data = {
            **message.dict(),
            "id": str(uuid.uuid4()),
            "sender_id": current_user.id,
            "created_at": datetime.utcnow().isoformat()
        }
        response = supabase.table("messages").insert(message_data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Categories
@api_router.get("/categories")
async def get_categories():
    return {
        "categories": [
            "Électronique", "Mode", "Maison & Jardin", "Sports", "Automobile",
            "Santé & Beauté", "Livres", "Jouets", "Alimentation", "Bijoux",
            "Outils", "Musique", "Art", "Voyage", "Business"
        ]
    }

# Countries and Cities (Francophone Africa)
@api_router.get("/locations")
async def get_locations():
    return {
        "countries": {
            "Cameroun": ["Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua"],
            "Côte d'Ivoire": ["Abidjan", "Bouaké", "Daloa", "Korhogo", "Yamoussoukro"],
            "Sénégal": ["Dakar", "Thiès", "Kaolack", "Saint-Louis", "Ziguinchor"],
            "Mali": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes"],
            "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"],
            "Niger": ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"],
            "Tchad": ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo"],
            "République Centrafricaine": ["Bangui", "Berbérati", "Carnot", "Bambari", "Bouar"],
            "Gabon": ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda"],
            "République du Congo": ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Impfondo"],
            "RDC": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kisangani", "Goma", "Bukavu", "Tshikapa", "Kikwit", "Mbandaka", "Matadi"]
        }
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
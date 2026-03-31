from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
import time
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

print(f"📡 Database host: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'unknown'}")

# Add sslmode=require if not present (fixes Render connection issues)
if "sslmode" not in DATABASE_URL:
    if "?" in DATABASE_URL:
        DATABASE_URL += "&sslmode=require&connect_timeout=10"
    else:
        DATABASE_URL += "?sslmode=require&connect_timeout=10"

# Retry logic for database connection (handles network delays)
max_retries = 5
retry_delay = 3
engine = None

for attempt in range(max_retries):
    try:
        print(f"🔄 Connection attempt {attempt + 1}/{max_retries}...")
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,      # Check connection before using
            pool_recycle=300,         # Recycle connections every 5 minutes
            pool_size=5,              # Number of connections to keep in pool
            max_overflow=10,          # Extra connections beyond pool_size
            connect_args={
                "connect_timeout": 10,
                "keepalives": 1,
                "keepalives_idle": 30,
                "keepalives_interval": 10,
                "keepalives_count": 5,
            }
        )
        # Test the connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Database connected successfully!")
            print(f"📦 PostgreSQL version: {version[:50]}...")
        break
    except OperationalError as e:
        print(f"⚠️ Connection attempt {attempt + 1} failed: {e}")
        if attempt < max_retries - 1:
            print(f"🔄 Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            print("❌ All connection attempts failed. Please check:")
            print("   1. Your DATABASE_URL in Render environment variables")
            print("   2. Your Supabase password is correct")
            print("   3. Your IP is allowed in Supabase (if using IP restrictions)")
            raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise

if engine is None:
    raise RuntimeError("Failed to create database engine after retries")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create declarative base for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"❌ Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# Optional: Function to check database health
def check_db_health() -> bool:
    """Check if database is reachable"""
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False

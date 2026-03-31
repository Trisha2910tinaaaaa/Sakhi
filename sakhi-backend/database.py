from sqlalchemy import create_engine
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
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,      # Check connection before using
            pool_recycle=300,         # Recycle connections every 5 minutes
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
            conn.execute("SELECT 1")
        print("✅ Database connected successfully!")
        break
    except OperationalError as e:
        print(f"⚠️ Connection attempt {attempt + 1} failed: {e}")
        if attempt < max_retries - 1:
            print(f"🔄 Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)
        else:
            print("❌ All connection attempts failed. Please check your DATABASE_URL.")
            raise

if engine is None:
    raise RuntimeError("Failed to create database engine after retries")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

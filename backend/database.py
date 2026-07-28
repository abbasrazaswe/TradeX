from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --------------------------------------------------------
# Local PostgreSQL connection for this project
# Format: postgresql://username:password@localhost/db_name
# --------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:post001@localhost/stock_app_db"

# Create the engine (the connection to the DB)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class (each request uses a separate session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models (tables) will inherit from this
Base = declarative_base()

# Dependency to get the database session in other files
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
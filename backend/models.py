import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Float
from database import Base

class Noticia(Base):
    __tablename__ = "noticias"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    titulo = Column(String, nullable=False)
    fecha_publicacion = Column(DateTime, default=datetime.utcnow)

    contenido_original = Column(Text, nullable=True)
    contenido_ia = Column(Text, nullable=True)

    categoria = Column(String, nullable=False)
    source_url = Column(String)

class DatoMercado(Base):
    __tablename__ = "mercados"
    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo = Column(String)
    simbolo = Column(Float)
    precio = Column(Float)
    cambio_porcentual = Column(Float)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
import requests
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import scraper
import ai_processor
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
import json
import os
import time

models.Base.metadata.create_all(bind=engine)

class SolicitudNewsletter(BaseModel):
    email: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"mensaje": "API Botbi funcionando"}

def obtener_criptos_coingecko():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 10,
        "page": 1,
        "sparkline": "false"
    }
    print("Consultando CoinGecko...")
    try:
        response = requests.get(url, params=params, timeout=3)
        if response.status_code == 200:
            datos = response.json()
            criptos = []
            for item in datos:
                criptos.append({
                    "simbolo": item['symbol'].upper(),
                    "precio": item['current_price'],
                    "cambio": round(item['price_change_percentage_24h'], 2)
                })
            return criptos
    except Exception as e:
        print(f"Error con coingecko: {e}")
    return []

CACHE_FILE = "mercados_cache.json"
CACHE_EXPIRATION = 86400  # 1 dia en segundos (para que solo llame 1 vez al día)

@app.get("/mercados")
def obtener_mercados():
    criptos = obtener_criptos_coingecko()
    #datos de respaldo por si falla la api
    if not criptos:
        criptos = [
            {"simbolo": "BTC", "precio": 64230.50, "cambio": 1.25},
            {"simbolo": "ETH", "precio": 3450.10, "cambio": -0.45},
            {"simbolo": "SOL", "precio": 145.20, "cambio": 5.10},
            {"simbolo": "BNB", "precio": 590.00, "cambio": 0.10}
        ]

    acciones = []
    usar_api = True

    if os.path.exists(CACHE_FILE):
        tiempo_archivo = os.path.getmtime(CACHE_FILE)
        tiempo_actual = time.time()
        
        if (tiempo_actual - tiempo_archivo) < CACHE_EXPIRATION:
            print("Usando datos cacheados")
            try:
                with open(CACHE_FILE, 'r') as f:
                    data_cache = json.load(f)
                    acciones = data_cache
                    usar_api = False
            except Exception as e:
                print(f"Error leyendo caché: {e}")

    if usar_api:
        print("Caché expirado o inexistente. Llamando a la api de las acciones")
        API_KEY = "d5l9g09r01qgqufl5310d5l9g09r01qgqufl531g"
        simbolos = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "V", "NFLX", "AMD"]
        
        nuevas_acciones = []
        for sim in simbolos:
            try:
                url = f"https://finnhub.io/api/v1/quote?symbol={sim}&token={API_KEY}"
                res = requests.get(url, timeout=3)
                data = res.json()
                
                if 'c' in data and data['c'] != 0:
                    nuevas_acciones.append({
                        "simbolo": sim,
                        "precio": round(data['c'], 2),
                        "cambio": round(data['dp'], 2)
                    })
            except Exception as e:
                print(f"Error Finnhub ({sim}): {e}")

        if nuevas_acciones:
            acciones = nuevas_acciones
            try:
                with open(CACHE_FILE, 'w') as f:
                    json.dump(acciones, f)
                print("Nuevos datos guardados en caché.")
            except Exception as e:
                print(f"No se pudo guardar caché: {e}")
        else:
            if os.path.exists(CACHE_FILE):
                print("API falló, usando caché antiguo como respaldo.")
                with open(CACHE_FILE, 'r') as f:
                    acciones = json.load(f)
    #datos de respaldo por si ya no jalo ni la api, ni el cache
    if not acciones:
        print("⚡️ Usando datos fijos de emergencia.")
        acciones = [
            {"simbolo": "AAPL", "precio": 224.50, "cambio": 1.45},
            {"simbolo": "MSFT", "precio": 415.10, "cambio": 0.85},
            {"simbolo": "NVDA", "precio": 1208.30, "cambio": 3.20},
            {"simbolo": "TSLA", "precio": 175.40, "cambio": -1.20},
            {"simbolo": "AMZN", "precio": 185.00, "cambio": 0.50}
        ]

    return {"acciones": acciones, "criptos": criptos}

@app.post("/sincronizar-noticias")
def sincronizar_noticias(db: Session = Depends(get_db)):
    print("Iniciando sincronización...")
    noticias_crudas = scraper.obtener_noticias_rss()
    noticias_guardadas = 0
    
    for item in noticias_crudas:
        existe = db.query(models.Noticia).filter(models.Noticia.titulo == item['titulo']).first()
        if existe:
            continue
        
        categoria, contenido_ia = ai_processor.procesar_noticia_con_ia(
            item['titulo'], 
            item['contenido']
        )
        
        nueva_noticia = models.Noticia(
            titulo=item['titulo'],
            contenido_original=item['contenido'], 
            contenido_ia=contenido_ia, 
            categoria=categoria,       
            source_url=item['link']
        )
        db.add(nueva_noticia)
        noticias_guardadas += 1
        print(f"Guardada: {item['titulo'][:20]}...")

    db.commit()
    return {"status": "ok", "nuevas_noticias": noticias_guardadas}

@app.get("/noticias")
def leer_noticias(db: Session = Depends(get_db)):
    return db.query(models.Noticia).order_by(models.Noticia.fecha_publicacion.desc()).all()


@app.post("/enviar-newsletter")
def enviar_newsletter(solicitud: SolicitudNewsletter, db: Session = Depends(get_db)):
    pool_noticias = db.query(models.Noticia).order_by(models.Noticia.fecha_publicacion.desc()).limit(30).all()
    
    if not pool_noticias:
        return {"status": "error", "mensaje": "No hay noticias."}

    print("IA ordenando noticias")
    try:
        noticias_seleccionadas = ai_processor.curar_newsletter_con_ia(pool_noticias)
    except Exception as e:
        print(f"Error IA Ranking: {e}. Usando orden por fecha.")
        noticias_seleccionadas = pool_noticias[:10]

    # --- TUS CREDENCIALES ---
    REMITENTE = "botbiprueba@gmail.com" 
    PASSWORD = "wdym aszz ifif lxub" 

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #111d21; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0;">Botbi <span style="color: #198cb3;">newsletter</span></h1>
                <p style="color: #aaa; font-size: 12px;">Top 10 - Curado por Inteligencia Artificial</p>
            </div>
            <div style="padding: 20px;">
                <p>Hola,</p>
                <p>Nuestra IA ha analizado el mercado y ha seleccionado estas 10 noticias críticas para hoy:</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
    """
    
    rank = 1
    for n in noticias_seleccionadas:
        color_badge = "#0284c7" if n.categoria == "Tecnología" else "#059669"
        bg_badge = "#e0f2fe" if n.categoria == "Tecnología" else "#d1fae5"
        
        html_content += f"""
            <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f0f0f0;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <span style="background: #333; color: #fff; padding: 2px 6px; font-size: 10px; border-radius: 4px;">#{rank}</span>
                    <span style="background: {bg_badge}; color: {color_badge}; padding: 2px 6px; font-size: 10px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">{n.categoria}</span>
                </div>
                <h3 style="margin: 5px 0; color: #111; font-size: 18px;">{n.titulo}</h3>
                <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 8px;">{n.contenido_ia}</p>
                <a href="{n.source_url}" style="font-size: 12px; color: #198cb3; text-decoration: none; font-weight: bold;">Leer análisis completo →</a>
            </div>
        """
        rank += 1

    html_content += """
            </div>
            <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 11px; color: #888;">
                <p>Ordenamiento realizado en tiempo real por Llama 3 (Groq)</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart()
        msg['From'] = REMITENTE
        msg['To'] = solicitud.email
        msg['Subject'] = "Top 10 Noticias de Impacto (IA Ranking)"
        msg.attach(MIMEText(html_content, 'html'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(REMITENTE, PASSWORD)
        text = msg.as_string()
        server.sendmail(REMITENTE, solicitud.email, text)
        server.quit()
        
        return {"status": "enviado", "mensaje": "Correo enviado con éxito"}
        
    except Exception as e:
        print(f"Error enviando correo: {e}")
        return {"status": "error", "mensaje": str(e)}
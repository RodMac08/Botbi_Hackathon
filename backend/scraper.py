import feedparser
from datetime import datetime

RSS_FEEDS = [
    "https://es.wired.com/feed/rss", 
    "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/negocios/portada"
]

def obtener_noticias_rss():
    """
    Descarga noticias crudas desde los RSS feeds.
    No guarda en DB todavía, solo retorna la lista de datos.
    """
    noticias_crudas = []
    print("Iniciando escaneo de fuentes")
    
    for url in RSS_FEEDS:
        feed = feedparser.parse(url)
        print(f"   -> Leyendo: {feed.feed.get('title', url)}")
        
        for entry in feed.entries[:5]:
            contenido = ""
            if 'summary' in entry:
                contenido = entry.summary
            elif 'content' in entry:
                contenido = entry.content[0].value
            
            noticia = {
                "titulo": entry.title,
                "link": entry.link,
                "contenido": contenido,
                "fecha": entry.get("published", datetime.now().isoformat())
            }
            noticias_crudas.append(noticia)
            
    return noticias_crudas
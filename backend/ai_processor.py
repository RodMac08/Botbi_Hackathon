import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)


MODELO_ACTUAL = "llama-3.3-70b-versatile" 

def procesar_noticia_con_ia(titulo, contenido):
    """
    Función 1: Resumir y Categorizar
    """
    prompt = f"""
    Analiza la siguiente noticia financiera:
    Título: {titulo}
    Contenido: {contenido[:1000]}...

    TAREA:
    1. Clasifícala en UNA de estas categorías: Tecnología, Negocios, Mercados, Economía, Cripto.
    2. Genera un resumen de 2 líneas enfocado en el impacto financiero.

    FORMATO DE RESPUESTA:
    Categoría: [Tu categoría]
    Resumen: [Tu resumen]
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres un analista financiero experto. Respondes breve y directo."},
                {"role": "user", "content": prompt}
            ],
            model=MODELO_ACTUAL,
            temperature=0.3,
        )

        respuesta = chat_completion.choices[0].message.content
        
        categoria = "General"
        resumen = "Resumen no disponible."
        
        lineas = respuesta.split('\n')
        for linea in lineas:
            if "Categoría:" in linea:
                categoria = linea.replace("Categoría:", "").strip()
            elif "Resumen:" in linea:
                resumen = linea.replace("Resumen:", "").strip()
                
        return categoria, resumen

    except Exception as e:
        print(f"Error IA: {e}")
        return "General", "Resumen automático no disponible."

def curar_newsletter_con_ia(lista_noticias):
    """
    Función 2: El Juez IA (Ranking para Newsletter)
    """
    if not lista_noticias:
        return []

    texto_para_ia = ""
    mapa_noticias = {} 
    
    for n in lista_noticias:
        texto_para_ia += f"ID: {n.id} | Título: {n.titulo}\n"
        mapa_noticias[str(n.id)] = n

    prompt = f"""
    Actúa como un Editor Senior de Bloomberg.
    Tienes la siguiente lista de noticias recientes (ID | Título):

    {texto_para_ia}

    TU TAREA:
    Selecciona las 10 noticias de mayor impacto financiero y relevancia global.
    Ordénalas de la más importante (1) a la menos importante (10).

    FORMATO DE RESPUESTA:
    Responde ÚNICAMENTE con los IDs separados por comas. Sin texto extra.
    Ejemplo: 14, 2, 55, 8, 9, 11, 23, 4, 1, 99
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Eres un algoritmo de ranking de noticias financieras. Solo devuelves IDs numéricos separados por comas."},
                {"role": "user", "content": prompt}
            ],
            model=MODELO_ACTUAL, 
            temperature=0.0,
        )

        respuesta = chat_completion.choices[0].message.content.strip()
        print(f"IA Ranking decidió: {respuesta}")

        ids_seleccionados_str = respuesta.replace(".", "").split(",")
        noticias_ordenadas = []

        for id_str in ids_seleccionados_str:
            id_limpio = id_str.strip()
            if id_limpio in mapa_noticias:
                noticias_ordenadas.append(mapa_noticias[id_limpio])

        if not noticias_ordenadas:
            print("La IA no devolvió IDs válidos, usando orden cronológico.")
            return lista_noticias[:10]

        return noticias_ordenadas[:10]

    except Exception as e:
        print(f"Error en el ranking IA: {e}")
        return lista_noticias[:10]
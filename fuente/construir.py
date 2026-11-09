"""Genera index.html (español) y en/index.html (inglés) desde fuente/plantilla.html.

En la plantilla cada texto va como [[español||inglés]]; {{LANG}} es el idioma y {{R}} el prefijo de rutas
('' en la raíz, '../' en /en/). Uso:  python fuente/construir.py
Edita SOLO la plantilla: los dos index.html se sobrescriben.
"""
import io, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plantilla = io.open(os.path.join(RAIZ, 'fuente', 'plantilla.html'), encoding='utf-8').read()
PAR = re.compile(r'\[\[(.*?)\|\|(.*?)\]\]', re.S)

def generar(idioma, prefijo):
    html = PAR.sub(lambda m: m.group(1) if idioma == 'es' else m.group(2), plantilla)
    html = html.replace('{{LANG}}', idioma).replace('{{R}}', prefijo)
    sobra = re.findall(r'\[\[|\]\]|\|\||\{\{\w+\}\}', html)
    if sobra:
        sys.exit('Marcas sin cerrar en la plantilla (%s): %s' % (idioma, sobra[:5]))
    return html

for idioma, prefijo, destino in (('es', '', 'index.html'), ('en', '../', os.path.join('en', 'index.html'))):
    ruta = os.path.join(RAIZ, destino)
    os.makedirs(os.path.dirname(ruta) or RAIZ, exist_ok=True)
    io.open(ruta, 'w', encoding='utf-8', newline='\n').write(generar(idioma, prefijo))
    print('OK', destino)

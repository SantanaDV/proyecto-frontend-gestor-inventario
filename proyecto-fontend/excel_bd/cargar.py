import pandas as pd
from sqlalchemy import create_engine, text
from datetime import datetime

# 🔧 Configura tus datos de conexión
db_user = 'root'
db_password = ''  # Asegúrate de que la contraseña esté correcta si la usas
db_host = 'localhost'
db_name = 'gestion_almacen'

# 📁 Ruta al archivo Excel
file_path = 'C:/Users/manue/Desktop/ficheroPrueba.xlsx'

# Conexión con MySQL
try:
    print("🔌 Estableciendo conexión con la base de datos...")
    engine = create_engine(f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}')
    conn = engine.connect()
    print("✅ Conexión exitosa con la base de datos MySQL.")
except Exception as e:
    print(f"❌ Error al conectar a la base de datos: {e}")
    exit(1)

# 📖 Leer todas las hojas del archivo Excel
try:
    print(f"📁 Leyendo el archivo Excel: {file_path}...")
    xls = pd.ExcelFile(file_path)
    hojas = xls.sheet_names
    data = {hoja: pd.read_excel(xls, hoja) for hoja in hojas}
    print(f"✅ Se han cargado las hojas: {hojas}")
except Exception as e:
    print(f"❌ Error al leer el archivo Excel: {e}")
    exit(1)

# 🔁 Procesar hoja por hoja
estado_defecto = "activo"
url_img_defecto = "https://tuservidor.com/imagen_por_defecto.jpg"
nfc_id_defecto = None
fecha_actual = datetime.now()

for hoja, df in data.items():
    print(f"🔄 Procesando hoja: {hoja}")

    # Establecer categoría para cada hoja (personalizable)
    id_categoria = 1

    # Verificar columnas requeridas
    if not {'codigo_qr', 'nombre', 'cantidad'}.issubset(df.columns):
        print(f"❌ Faltan columnas requeridas en la hoja '{hoja}'")
        continue

    # Insertar cada fila
    for _, row in df.iterrows():
        try:
            query = text('''
                INSERT INTO productos (
                    codigo_qr, nombre, cantidad, estado, fecha_creacion,
                    url_img, nfc_id, id_categoria
                ) VALUES (:codigo_qr, :nombre, :cantidad, :estado, :fecha_creacion, :url_img, :nfc_id, :id_categoria)
            ''')

            params = {
                'codigo_qr': row['codigo_qr'],
                'nombre': row['nombre'],
                'cantidad': int(row['cantidad']),
                'estado': estado_defecto,
                'fecha_creacion': fecha_actual,
                'url_img': url_img_defecto,
                'nfc_id': nfc_id_defecto,
                'id_categoria': id_categoria
            }

            conn.execute(query, params)
            print(f"✅ Producto {row['codigo_qr']} insertado correctamente.")
        except Exception as e:
            print(f"❌ Error al insertar el producto con código QR {row['codigo_qr']}: {e}")

# Cerrar la conexión
try:
    conn.close()
    print("✅ Conexión cerrada correctamente.")
except Exception as e:
    print(f"❌ Error al cerrar la conexión: {e}")

print("✅ Datos cargados exitosamente en MySQL.")
input("Presiona Enter para salir...")

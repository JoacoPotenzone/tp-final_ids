# tp-final_ids: 

#MatchAirlines – Seguimiento de vuelos Mundial 2026 
Este proyecto consiste en una aplicación web que permite realizar el seguimiento de vuelos relacionados con el Mundial 2026, conectando a los usuarios con información de vuelos, aeropuertos y estadios cercanos.


# Descripción general

MatchAirlines es una plataforma que permite a los usuarios:

- Realizar seguimiento de vuelos con origen o destino en los países sede del Mundial 2026 (**Estados Unidos, Canadá y México**).  
- Consultar vuelos que lleguen desde cualquier parte del mundo hacia dichos países.  
- Recibir información sobre estadios cercanos a los aeropuertos donde hayan aterrizado.  
- Interactuar mediante un perfil personal y recibir notificaciones de interés.  

La aplicación cuenta con una interfaz de administración (CRUD) donde los administradores pueden gestionar usuarios, vuelos, aeropuertos, aerolíneas y estadios.


# Entidades principales

-Usuarios: id_usuario, Correo, Nombre, Contrasenia, id_vuelo(FK), ROL(admin/usuario) 
-Vuelos: id_vuelo, Origen, Destino, Fecha, id_aerolinea(FK), precio 
-Aeropuertos: id_aeropuerto, id_vuelos(FK), Nombre, Ciudad, Pais 
-Aerolinea: id_aerolinea, id_aeropuertos(FK), Nombre, Pais 
-Estadios: id_estadio, nombre, ciudad, pais, id_aeropuerto(FK)


# Páginas de la aplicación

#Home
- Presenta la bienvenida al sitio y la descripción del proyecto.  
- Muestra un buscador para filtrar vuelos por país, ciudad o aerolínea.  
- Incluye accesos directos al inicio de sesión y registro de usuario.  
- Desde aquí se puede acceder al seguimiento de vuelos destacados del día.


#Perfil de usuario
- Muestra los datos personales del usuario y su historial de vuelos seguidos.  
- Permite modificar información personal (nombre, correo, contraseña).  
- Presenta notificaciones sobre próximos vuelos o estadios cercanos.  
- Incluye opción de cerrar sesión.


#Seguimiento de vuelo
- Página principal de consulta de vuelos.  
- Permite buscar vuelos por número, país o ciudad.  
- Muestra detalles: origen, destino, fecha, aerolínea y precio.  
- Indica los estadios más cercanos al aeropuerto de destino.  
- Opción para agregar el vuelo a la lista personal del usuario.


#Panel de administrador (CRUD)
- Acceso exclusivo para usuarios con rol admin.  
- Permite crear, leer, actualizar y eliminar (CRUD) registros de:
  - Usuarios  
  - Vuelos  
  - Aeropuertos  
  - Aerolíneas  
  - Estadios  
- Incluye panel de control con métricas básicas (total de vuelos, usuarios activos, etc.).



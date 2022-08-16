<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clonar el proyecto
2. ```yarn install```
3. Clonar el archivo ```.emv.template``` y renombrar a ```.env```
4. Cambiar las variables de entorno
5. Levantar la base de datos
```
docker-compose up -d
```
- En caso de no permitir conexion desde el cliente
- Error en autenticación 
  - 1.1.  Eliminar el contenedor que no deja acceder
  - 1.2.	Levantar el contenedor con: ```docker-compose up -d```
  - 1.3.	Añadir en el yaml, ```user: postgres```
  - 1.4.	Iniciar terminal de docker para postgres
  - 1.5.	Iniciar consola de consulta: ```psql```	
  - 1.6.	Definir la contraseña por defecto para user postgres:
  ```ALTER ROLE postgres WITH PASSWORD 'your_password';```  
6. Levantar en modo desarrollo ```yarn start:dev```
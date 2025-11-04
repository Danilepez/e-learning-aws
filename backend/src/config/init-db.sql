-- Script de inicialización de base de datos para AWS RDS
-- Este script debe ejecutarse conectándose primero a la base de datos 'postgres'

-- Crear la base de datos si no existe
CREATE DATABASE "elearning-dani-db";

-- Conectar a la base de datos (esto se hace manualmente después)
-- \c elearning-dani-db

-- El resto del schema se ejecuta desde schema.sql

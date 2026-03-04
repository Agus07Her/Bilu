-- Tabla Productos
CREATE TABLE Productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    precio_costo DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Transacciones
CREATE TABLE Transacciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) CHECK (tipo IN ('Ingreso', 'Gasto')) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    descripcion TEXT,
    producto_id INT,
    FOREIGN KEY (producto_id) REFERENCES Productos(id) ON DELETE SET NULL
);

-- Tabla/Vista Balance
CREATE VIEW Balance AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'Ingreso' THEN monto ELSE 0 END), 0) AS total_ingresos,
    COALESCE(SUM(CASE WHEN tipo = 'Gasto' THEN monto ELSE 0 END), 0) AS total_gastos,
    COALESCE(SUM(CASE WHEN tipo = 'Ingreso' THEN monto ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN tipo = 'Gasto' THEN monto ELSE 0 END), 0) AS balance_total
FROM Transacciones;

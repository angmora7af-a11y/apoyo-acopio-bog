¡Claro que sí! Vamos a estructurar las **Historias de Usuario (HU)** y el **Plan de Requerimientos (PDR)** de forma clara, ordenada y con un enfoque **minimalista y práctico** para que sea ultra fácil de leer y llevar a desarrollo.

---

## 🏗️ Plan de Requerimientos (PDR)

### 1. Definición de Roles

* **Voluntario:** Acceso simplificado mediante registro básico (Nombre y Documento). Carga y consulta información operativa de los 3 módulos.
* **Administrador:** Mismos permisos que el voluntario, pero con acceso exclusivo a métricas globales, gestión completa y modificación/eliminación de registros.

### 2. Módulos del Sistema

1. **Registro de Ayuda (Donaciones):** Gestión de entrada de kits/cajas por categorías en el centro de acopio.
2. **Módulo de Envíos:** Logística de despacho y despacho hacia zonas de destino.
3. **Módulo de Recepciones:** Confirmación y registro del material recibido en punto final.

---

## 👤 Módulo 0: Acceso Simplificado

### **HU-01: Registro/Ingreso de Voluntario**

> **Como** voluntario o administrador,
> **quiero** ingresar mi nombre y número de documento,
> **para** identificarme rápidamente en la plataforma sin un proceso complejo de contraseña.

* **Criterios de Aceptación:**
* Formulario simple con 2 campos: *Nombre Completo* y *Número de Documento*.
* El sistema guarda los datos en la tabla `Voluntarios` sin requerir validación/clave.
* Mantiene la sesión activa localmente para asociar los registros creados al usuario.



---

## 📦 Módulo 1: Registro de Ayuda (Donaciones)

### **HU-02: Registrar Entrada de Donación**

> **Como** voluntario,
> **quiero** registrar las cajas ingresadas por categoría en el centro de acopio,
> **para** llevar un control del inventario disponible.

* **Campos del Formulario:**
* **Datos de Cabecera:** Centro de Acopio, Responsable (autocompletado o manual), Fecha de registro (automática/editable).
* **Categoría y Conteo (# de cajas):**
* Aseo personal / Cuidado personal e higiene
* Alimentos no perecederos
* Alimentos para mascotas
* Medicamentos
* Insumos médicos y hospitalarios
* Suministros de rescate
* Refugio
* Ropa


* **Detalles Adicionales:** Comentarios (texto libre), Destino asignado (opcional).


* **Criterios de Aceptación:**
* Interfaz con contadores visuales (+ / -) o inputs numéricos limpios.
* Cálculo automático del total de cajas en la pantalla (**Resumen de Categorías**).



### **HU-03: Marcar Carga Listo para Enviar**

> **Como** voluntario,
> **quiero** marcar un registro de donación como "Listo para enviar",
> **para** habilitarlo en el módulo de envíos.

* **Criterios de Aceptación:**
* Checkbox simple con estado visual claro (ej. Badge verde: *Listo*).



---

## 🚚 Módulo 2: Envíos (Despacho Logístico)

### **HU-04: Registrar Envío de Carga**

> **Como** voluntario,
> **quiero** completar un formulario de despacho asociando la donación a un medio de transporte,
> **para** asegurar la trazabilidad del envío hacia el destino.

* **Campos del Formulario:**
* **Transporte:** Tipo (Carro, Avión, Vuelo, etc.) y Capacidad (en Toneladas).
* **Empresa / Aliado:** Nombre de la empresa que apoya (Ej: Satena, Avianca, etc. - *Texto abierto / Opcional*).
* **Responsables:** Nombre del responsable del transportador y Número de contacto.
* **Ruta y Tiempo:** Fecha, Hora, Placa / Matrícula del vehículo, Ciudad Origen y Ciudad Destino.
* **Asociación de Carga:** Selector para vincular qué donaciones/cajas van en este envío (asociadas a la HU-03).


* **Criterios de Aceptación:**
* Un solo formulario continuo y sin pasos innecesarios.
* El sistema actualiza el estado de las donaciones asociadas a "En Tránsito".



---

## 📥 Módulo 3: Recepciones

### **HU-05: Registrar Recepción de Carga**

> **Como** voluntario en destino,
> **quiero** registrar la llegada del transporte y confirmar la entrega,
> **para** cerrar el ciclo logístico del envío.

* **Campos del Formulario:**
* **Receptor:** Nombre de quien recibe en el punto de destino.
* **Verificación del Transporte:** Tipo de transporte, Capacidad (Ton), Empresa aliada (Opcional), Responsable del transportador, Contacto, Placa/Matrícula, Fecha/Hora de llegada, Origen y Destino.
* **Asociación:** Selección del envío que está arribando.


* **Criterios de Aceptación:**
* Al guardar la recepción, la donación/carga cambia a estado "Entregado/Recibido".



---

## 🎨 Guias para el Diseño UI/UX (Minimalista y Práctico)

| Elemento | Lineamiento de Diseño |
| --- | --- |
| **Tipografía** | Fuente *Sans-Serif* limpia (ej. Inter, Roboto) con alto contraste para lectura rápida. |
| **Formularios** | Diseño a 1 o 2 columnas máximo. Espaciados amplios (padding) para evitar saturación visual. |
| **Listados/Tablas** | Tarjetas (*Cards*) para móviles y tablas minimalistas sin bordes pesados para escritorio. |
| **Colores** | Base neutra (blancos/grises claros) con un único color primario (ej. Azul o Verde) para acciones principales. |
| **Acciones** | Botones grandes, claros y con estados visibles (*Cargando*, *Guardado exitoso*). |
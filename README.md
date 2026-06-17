# QUIPU

SaaS fintech para PyMEs de LatAm que centraliza caja, cobros, pagos, tesorería, reportes y análisis financiero asistido por IA.

**Estado:** prototipo SaaS totalmente funcional creado como proyecto de portfolio. Está conectado a una base de datos real alojada en Neon, con información empresarial simulada para fines de demo, pero lista para usarse si fuera necesario.

---

## Demo

**Producto online:**  
https://quipu-saas-b2b-ai-fintech.vercel.app/inicio

**Usuario demo:**  
- Email: demo@quipu.com
- Password: Demo1234

> Nota: la información visible en la demo es simulada y fue creada para mostrar el funcionamiento completo del producto. Al loguearte, podés consultar información, agregarla o eliminarla, así como también hacer consultas a la IA. Toda la información que tomará como base es la cargada en la base de datos del usuario demo. Los cambios que efectúes, como eliminaciones o creaciones, impactarán en tiempo real en la base de datos.

---

## Qué es QUIPU

QUIPU es una plataforma SaaS pensada para ayudar a PyMEs a ordenar su información financiera y convertirla en una vista clara, simple y accionable.

El objetivo es que dueños, gerentes generales, equipos financieros o perfiles de dirección puedan entender rápidamente la salud financiera del negocio, anticipar problemas de caja, priorizar cobros y pagos, generar reportes y apoyarse en un copiloto con IA para tomar mejores decisiones.

---

## Problema

Muchas PyMEs gestionan su información financiera de forma dispersa entre bancos, planillas, facturas, comprobantes, reportes manuales y conversaciones internas.

Esto dificulta responder preguntas simples pero importantes:

- ¿Cuánta caja disponible tengo hoy?
- ¿Qué cobros están pendientes?
- ¿Qué pagos vencen pronto?
- ¿Dónde está concentrado el riesgo financiero?
- ¿Cómo viene la salud financiera del negocio?
- ¿Qué acciones debería priorizar?

---

## Propuesta de valor

QUIPU busca centralizar la gestión financiera operativa de una PyME en una sola plataforma.

La solución combina:

- dashboard financiero;
- gestión de caja;
- seguimiento de cobros;
- seguimiento de pagos;
- vista de tesorería;
- reportes simples;
- KPIs, tablas y gráficos;
- alertas;
- acciones sugeridas;
- copiloto financiero con IA.

La intención no es solo mostrar datos, sino ayudar al usuario a entender qué está pasando y qué decisiones podría tomar.

---

## Funcionalidades principales

### Dashboard inicial

Vista general de la salud financiera del negocio, con indicadores clave, métricas principales y resumen de actividad.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/cec5dce4-9db7-4d6a-a284-5fbbbb2d4f1b" />
*Dashboard principal con visión general de caja, cobros, pagos e indicadores financieros.*

---

### Caja

Módulo para visualizar la caja disponible, movimientos recientes e información relevante sobre liquidez.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/10bc0fec-91e5-4268-b89e-d66ed9f4af8b" /> 
*Módulo de caja con información sobre disponibilidad, movimientos e impactos financieros.*

---

### Cobros

Seguimiento de cuentas por cobrar, clientes pendientes, vencimientos y posibles prioridades de gestión.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/508a84f6-b824-4981-a844-43b054ad66f4" />
*Módulo de cobros con listado de cuentas pendientes, estados y fechas relevantes.*

---

### Pagos

Seguimiento de cuentas por pagar, proveedores, vencimientos y compromisos próximos.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/534d8e83-95eb-4270-8d01-a922b71b5c9e" /> 
*Módulo de pagos con obligaciones próximas, estados y prioridades.*

---

### Tesorería

Vista consolidada para entender flujos financieros, saldos, movimientos y necesidades de liquidez.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/eeaf19f0-0d27-4c51-ad89-47861a9fd86f" />  
*Módulo de tesorería con visión consolidada de flujos financieros.*

---

### Reportes

Reportes financieros simples para analizar información relevante del negocio y facilitar la toma de decisiones.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/8e179d00-0a6b-4d54-8ce8-d94ffcbfb00e" /> 
*Sección de reportes con indicadores, tablas y visualizaciones financieras.*

---

### Alertas y acciones sugeridas

QUIPU incluye alertas sobre eventos relevantes y recomendaciones accionables para ayudar al usuario a priorizar.

Ejemplos:

- cobros próximos a vencer;
- pagos relevantes;
- posibles riesgos de caja;
- movimientos que requieren atención;
- acciones sugeridas según la información disponible.

---

### Workflow automático de facturas vencidas

QUIPU detecta facturas vencidas pendientes y genera alertas automáticas en el dashboard.

El workflow consulta datos persistidos en Neon, crea alertas en la tabla `alerts` y evita duplicados mediante una restricción única.

Endpoint:

`POST /api/workflows/overdue-invoice-alerts`

---

## Copiloto IA

QUIPU incorpora un copiloto financiero con IA dentro de la plataforma.

El usuario puede hacer preguntas sobre la situación financiera del negocio, y el agente interpreta la consulta, consulta información asociada al usuario en la base de datos y devuelve una respuesta clara y ordenada dentro del chat.

El copiloto cuenta con historial de conversaciones, lo que permite mantener trazabilidad sobre consultas anteriores.

<img width="1366" height="613" alt="image" src="https://github.com/user-attachments/assets/36f8f8e8-a08f-476e-ad0c-f87d65282da0" /> 
*Copiloto IA integrado dentro del SaaS, con consultas financieras y respuestas generadas a partir de la información del negocio.*

---

## Datos y base de datos

El producto está conectado a una base de datos real alojada online en Neon.

La información utilizada en la demo es simulada, pero está estructurada en una base real con tablas, relaciones y datos persistentes para representar el funcionamiento de una PyME dentro del sistema.

Esto permite mostrar:

- login y usuario demo;
- información asociada a una empresa;
- módulos conectados a datos;
- consultas desde el copiloto IA;
- respuestas basadas en información almacenada;
- persistencia de conversaciones.

<img width="4681" height="4188" alt="mermaid-diagram-quipu-saas" src="https://github.com/user-attachments/assets/f7ee9cf6-feba-4d9e-9b03-9a95647ad51f" />
*Vista de la base de datos en Neon con tablas utilizadas por el producto.*

---

## Aprendizajes del proyecto

QUIPU fue el primer proyecto donde empecé a trabajar de forma más cercana a un flujo profesional de desarrollo.

Me enfoqué en ordenar mejor los commits, separar cambios por ramas, cuidar los ambientes de trabajo y entender cómo se estructura un proyecto más grande a medida que crece.

Más allá del resultado funcional, este proyecto me ayudó a comprender mejor cómo trabaja un developer y qué necesita para avanzar con mayor claridad, contexto y foco.

---

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- SQL
- Neon
- OpenAI API
- Vercel

### Workflow de desarrollo

- GitHub para versionado y documentación del repositorio.
- Vercel para deploy del producto.
- Cursor como editor principal.
- ChatGPT como asistencia durante el proceso de ideación, desarrollo y documentación.
- APIs para conectar frontend, base de datos y servicios de IA.

---

## Arquitectura general

```txt
Usuario
  ↓
Frontend SaaS
Next.js + TypeScript + Tailwind + shadcn/ui
  ↓
APIs internas
  ↓
Base de datos Neon / SQL
  ↓
Copiloto IA
OpenAI API + datos del negocio

# PRD — Lab 3: Telemetría Térmica e Integración de Potencia (V2)

## 🧩 1. Overview
**Objetivo:** Desarrollar una estación de monitoreo inalámbrica que simule la cadena completa de telemetría térmica: desde la captura en puente de Wheatstone hasta la actuación mecánica vía PWM-IR.

## 🎯 2. Arquitectura de Flujo (No Etapas)
A diferencia de laboratorios anteriores, la UI debe representar un **Diagrama de Bloques Vivo**:
1. **Módulo Captura (TX):** 
   - Entrada dual (RTD + LM35).
   - Acondicionamiento a $0.1V/°C$.
   - Modulador PWM (Portadora $100Hz$ generada por integrador 555).
2. **Módulo Inalámbrico (Air Gap):**
   - Animación conceptual de fotones IR transmitiendo el ancho de pulso.
   - Parámetro de distancia (atenuación conceptual).
3. **Módulo Recuperación (RX):**
   - Fototransistor + Filtro Activo Sallen-Key.
   - Visualización de la "limpieza" del PWM para recuperar el valor DC.
4. **Módulo Actuación (Control):**
   - Comparadores de ventana con umbrales fijos (25°C, 35°C).
   - Drivers de potencia para LED RGB y Ventilador 12V.

## 🖥 3. Requisitos de Visualización
- **Osciloscopio Multicanal:** 
  - Canal A: Señal PWM en TX.
  - Canal B: Señal Recuperada tras el Filtro Activo (RX).
  - Superposición para ver el rizado del filtro.
- **Instrumentación de Potencia:** Amperímetros virtuales para los LEDs (50mA, 70mA, 100mA).
- **Animación Mecánica:** Velocidad del ventilador acoplada a la temperatura real promediada.

## ⚙ 4. Parámetros Técnicos Críticos
- Alimentación: $\pm 12V$.
- Portadora: $100Hz$ (0V a 6V).
- Salida PWM: 0V a 5V.
- Filtro Activo: Segundo orden (Sallen-Key).

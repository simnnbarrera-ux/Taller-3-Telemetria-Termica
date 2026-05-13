# Análisis Técnico — Lab 3: Telemetría Térmica

Este documento detalla el modelado matemático previo necesario para la implementación del Laboratorio 3.

## 1. Puente de Wheatstone (RTD)
El RTD (Pt100) varía su resistencia según $R(T) = R_0(1 + \alpha T)$.
- Para $20^\circ C$: $R \approx 107.8 \Omega$.
- Para $50^\circ C$: $R \approx 119.4 \Omega$.

El puente se diseñará para estar balanceado a $0^\circ C$ ($100 \Omega$) o a $20^\circ C$ según convenga. Usaremos un amplificador de instrumentación (o diferencial) para extraer la señal.

## 2. Acondicionamiento (Adecuación)
La meta es $0.1 V/^\circ C$.
- A $20^\circ C \to 2.0 V$.
- A $50^\circ C \to 5.0 V$.

Esto requiere una etapa de ganancia y offset:
$$ V_{out} = m \cdot V_{sensor} + b $$
Donde $m$ es la pendiente calculada para mapear el rango de los sensores al rango de $2V-5V$.

## 3. Generador de Portadora (Triangular 100Hz)
Usaremos un Timer 555 en modo astable para generar una onda cuadrada, seguida de un integrador de Miller para obtener la rampa.
- Frecuencia: $f = 100 Hz$.
- Amplitud: $6 V_{pp}$ (Offset para que sea $0V$ a $6V$).

## 4. Modulación PWM
Se logra comparando la $V_{adecuada}$ (promedio de temperatura) con la rampa triangular.
- Si $V_{temp} > V_{tri} \implies PWM = HIGH$.
- Al aumentar la temperatura, $V_{temp}$ sube y el ancho del pulso aumenta.

## 5. Filtro Activo de Recuperación
Para convertir el PWM de vuelta a DC, usaremos un filtro pasa bajos Sallen-Key de segundo orden.
- Frecuencia de corte ($f_c$): Debe ser mucho menor que $100 Hz$ para eliminar el rizado de la portadora, pero lo suficientemente rápida para seguir cambios térmicos (ej. $f_c = 1 Hz$).

## 6. Etapa de Actuación (Comparadores de Ventana)
Usaremos OpAmps como comparadores con histéresis para evitar parpadeos en los límites de $25^\circ C$ ($2.5V$) y $35^\circ C$ ($3.5V$).

### Corrientes de Carga:
- **LED Azul**: $I = 50mA$. Requiere BJT (ej. 2N2222).
- **LED Verde**: $I = 70mA$. Requiere BJT.
- **LED Rojo + Ventilador**: $I_{total} > 100mA$. Requiere MOSFET (ej. IRFZ44N).

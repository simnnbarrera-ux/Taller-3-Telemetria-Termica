import numpy as np
import matplotlib.pyplot as plt

def solve_lab3_math():
    # 1. Parámetros del RTD (Pt100)
    R0 = 100 # Ohms @ 0°C
    alpha = 0.00385 # Coeficiente estándar Pt100
    
    temps = np.linspace(20, 50, 100)
    R_rtd = R0 * (1 + alpha * temps)
    
    # 2. Puente de Wheatstone (Diseño)
    # Alimentación Vcc = 12V
    # Queremos balance a 20°C para simplificar o dejarlo a 0°C
    R_balance = 100 # Balanceado a 0°C
    R_fixed = 1000 # Resistencias del puente para limitar corriente
    Vcc = 12
    
    # V_bridge = Vcc * (R_rtd / (R_fixed + R_rtd) - R_balance / (R_fixed + R_balance))
    v_bridge = Vcc * (R_rtd / (R_fixed + R_rtd) - R_balance / (R_fixed + R_balance))
    
    # 3. Adecuación (Meta: 0.1V/°C)
    # A 20°C -> 2.0V
    # A 50°C -> 5.0V
    # Usamos LM35 que ya entrega 0.01V/°C. Adecuación del LM35 es G=10.
    v_lm35 = 0.01 * temps
    v_lm35_adecuada = v_lm35 * 10 # 0.1V/°C directo
    
    # Adecuación del RTD (Diferencial)
    # Delta_V_bridge (20 to 50)
    dv_20 = Vcc * (R_rtd[0] / (R_fixed + R_rtd[0]) - R_balance / (R_fixed + R_balance))
    dv_50 = Vcc * (R_rtd[-1] / (R_fixed + R_rtd[-1]) - R_balance / (R_fixed + R_balance))
    
    gain_rtd = (5.0 - 2.0) / (dv_50 - dv_20)
    offset_rtd = 2.0 - (gain_rtd * dv_20)
    
    v_rtd_adecuada = gain_rtd * v_bridge + offset_rtd
    
    # 4. Promedio
    v_avg = (v_lm35_adecuada + v_rtd_adecuada) / 2
    
    # 5. Modulación PWM
    # Portadora Triangular: 0V a 6V
    f_tri = 100
    t = np.linspace(0, 0.05, 1000) # 50ms
    v_tri = 3 * (2 * np.abs(2 * (f_tri * t - np.floor(f_tri * t + 0.5))) ) # 0 to 6V
    
    # Visualización
    plt.figure(figsize=(12, 8))
    
    plt.subplot(2, 1, 1)
    plt.plot(temps, v_lm35_adecuada, label="Sensor LM35 (Adecuado)")
    plt.plot(temps, v_rtd_adecuada, '--', label="RTD (Adecuado)")
    plt.plot(temps, v_avg, 'k', lw=2, label="Promedio (V_temp)")
    plt.grid(True)
    plt.title("Adecuación de Sensores (0.1V/°C)")
    plt.ylabel("Voltaje (V)")
    plt.xlabel("Temperatura (°C)")
    plt.legend()
    
    plt.subplot(2, 1, 2)
    t_fixed = 0.01 # Un instante de tiempo
    v_temp_test = 3.5 # 35°C
    pwm = np.where(v_temp_test > v_tri, 5, 0)
    plt.plot(t * 1000, v_tri, label="Portadora Triangular (0-6V)")
    plt.axhline(y=v_temp_test, color='r', label="V_temp (35°C)")
    plt.step(t * 1000, pwm, color='g', where='post', label="Salida PWM (0-5V)")
    plt.title("Modulación PWM @ 35°C")
    plt.xlabel("Tiempo (ms)")
    plt.ylabel("Voltaje (V)")
    plt.legend()
    
    plt.tight_layout()
    plt.show()
    
    print(f"Ganancia RTD requerida: {gain_rtd:.2f}")
    print(f"Offset RTD requerido: {offset_rtd:.2f}V")

if __name__ == "__main__":
    solve_lab3_math()

const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');
const chatBox = document.getElementById('chat-box');

// API KEY
const GROQ_API_KEY = "gsk_gMmaIgoxax" + "jugUyWBk2xWGdyb3FYMmSPhngnbJGjakG7BvU7oI60";

let isPaused = false;
let tOffset = 0;
let lastTime = 0;

// Estado del Sistema
let tempRTD = 25.0;
let tempLM35 = 30.0;
let avgTemp = 27.5;
let vAdecuado = 2.75;
let freqTri = 100;
let voltTri = 6.0;
let optNoise = 0.05;

// Estado Receptora
let vRecuperado = 0;

function updateSystem() {
    tempRTD = parseFloat(document.getElementById('temp-rtd').value);
    tempLM35 = parseFloat(document.getElementById('temp-lm35').value);
    freqTri = parseFloat(document.getElementById('freq-tri').value);
    voltTri = parseFloat(document.getElementById('volt-tri').value);
    optNoise = parseFloat(document.getElementById('opt-noise').value);

    avgTemp = (tempRTD + tempLM35) / 2;
    vAdecuado = avgTemp * 0.1;

    // Simulación de recuperación
    // Si voltTri es menor que vAdecuado, hay saturación/distorsión
    let recoveryFactor = (voltTri > vAdecuado) ? 0.98 : (voltTri / vAdecuado) * 0.5;
    vRecuperado = vAdecuado * recoveryFactor;

    updateUI();
}

function updateUI() {
    // TX Displays
    document.getElementById('val-rtd').innerText = tempRTD.toFixed(1);
    document.getElementById('val-lm35').innerText = tempLM35.toFixed(1);
    document.getElementById('val-freq').innerText = freqTri;
    document.getElementById('val-volt').innerText = voltTri.toFixed(1);

    // 7-SEGMENT DISPLAY
    document.getElementById('temp-display').innerText = avgTemp.toFixed(1);

    // RX Displays
    document.getElementById('val-vrec').innerText = vRecuperado.toFixed(2) + " V";
    document.getElementById('bar-vrec').style.width = (vRecuperado / 6 * 100) + "%";

    // Actuadores
    const isCold = avgTemp < 25;
    const isNormal = avgTemp >= 25 && avgTemp <= 35;
    const isHot = avgTemp > 35;

    document.getElementById('led-blue').classList.toggle('active', isCold && voltTri > 0.5);
    document.getElementById('led-green').classList.toggle('active', isNormal && voltTri > 0.5);
    document.getElementById('led-red').classList.toggle('active', isHot && voltTri > 0.5);
    
    const fan = document.getElementById('fan-motor');
    if (isHot && voltTri > 1) {
        fan.classList.add('fan-spinning');
        let speed = 0.6 - ((avgTemp - 35) / 15) * 0.4; 
        fan.style.setProperty('--fan-speed', `${Math.max(0.1, speed)}s`);
        document.getElementById('fan-power').innerText = Math.round(((avgTemp - 20)/30)*100) + "%";
    } else {
        fan.classList.remove('fan-spinning');
        document.getElementById('fan-power').innerText = "0%";
    }
}

function autoset() {
    document.getElementById('freq-tri').value = 100;
    document.getElementById('volt-tri').value = 6.0;
    document.getElementById('opt-noise').value = 0.05;
    updateSystem();
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').innerText = isPaused ? "REANUDAR" : "PAUSAR";
    document.getElementById('pause-btn').style.background = isPaused ? "#e67e22" : "#333";
}

// --- SEÑALES ---
function getSignals(t) {
    const f = freqTri;
    const amp = voltTri;
    const vTri = amp * (Math.abs(2 * (f * t - Math.floor(f * t + 0.5))));
    
    const pwm = (amp > 0.1 && vAdecuado > vTri) ? 5 : 0;
    
    // El ruido afecta la recuperación
    const noise = (Math.random() - 0.5) * optNoise * 3;
    const rizado = 0.04 * Math.sin(2 * Math.PI * f * t);
    const rec = (voltTri > 0.1) ? vRecuperado + rizado + noise : 0;

    return { pwm, rec, vTri };
}

// --- OSCILOSCOPIO ---
function draw(now) {
    if (!isPaused) {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        tOffset += delta * 0.08;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const timeWin = 0.04;

        // Trace 1: PWM (TX) - Amarillo
        ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const t = (x / w) * timeWin + tOffset;
            const { pwm } = getSignals(t);
            const y = h/2.5 - (pwm * (h/20)); 
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Trace 2: Recuperada (RX) - Verde
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
            const t = (x / w) * timeWin + tOffset;
            const { rec } = getSignals(t);
            const y = h * 0.8 - (rec * (h/10)); 
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Animación IR
        const wave = document.getElementById('photon-wave');
        const { pwm: currentPwm } = getSignals(performance.now()/1000);
        if (currentPwm > 0 && voltTri > 0.5) {
            wave.style.opacity = (voltTri / 10) * (1 - optNoise);
            wave.style.left = ( (Date.now() % 1000) / 1000 * 100 ) + "%";
        } else {
            wave.style.opacity = 0;
        }
    }
    requestAnimationFrame(draw);
}

async function askRigoberto() {
    const input = document.getElementById('user-input');
    const text = input.value;
    if (!text) return;
    
    chatBox.innerHTML += `<p><b>Tú:</b> ${text}</p>`;
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    const context = `LAB 3: Sensores (20-50 C), Adecuacion (0.1V/C), PWM (100Hz IR), Filtro Sallen-Key. 
    ESTADO: Temp=${avgTemp}C, Freq=${freqTri}Hz, Volt=${voltTri}V, Ruido=${optNoise}.`;
    
    try {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: "Eres Rigoberto. Responde en texto plano breve. Explica fenomenos del Lab 3." },
                    { role: "user", content: text + " (Contexto: " + context + ")" }
                ] 
            })
        });
        const d = await r.json();
        chatBox.innerHTML += `<p><b>Rigoberto:</b> ${d.choices[0].message.content}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) { 
        chatBox.innerHTML += `<p><i>Error de IA.</i></p>`; 
    }
}

window.onload = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    lastTime = performance.now();
    updateSystem();
    draw(lastTime);
};

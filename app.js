const canvas = document.getElementById('oscilloscope');
const ctx = canvas.getContext('2d');
const chatBox = document.getElementById('chat-box');

// La API Key ahora se maneja de forma segura en Vercel (Variable de Entorno)
let isPaused = false;
let tOffset = 0;
let lastTime = 0;
let currentLang = 'es';

let tempRTD = 25.0, tempLM35 = 30.0, avgTemp = 27.5, vAdecuado = 2.75;
let freqTri = 100, voltTri = 6.0, optNoise = 0.05, vRecuperado = 0;

const TRANSLATIONS = {
    es: {
        titleMain: "Telemetría Térmica & Control PWM-IR",
        titleSub: "Laboratorio #3: Diseño con Op-Amps",
        ctxTitle: "Objetivo del Laboratorio",
        ctxDesc1: "Esta simulación representa un sistema industrial de monitoreo inalámbrico. El objetivo es procesar la temperatura de dos puntos (RTD y LM35), promediarlos y transmitir ese dato mediante <b>telemetría óptica (Infrarrojos)</b> usando modulación por ancho de pulso (PWM).",
        ctxHint: "Dato Técnico:", ctxHintDesc: "El 'Ruido Óptico' simula la interferencia de luz externa.",
        labelTx: "TRANSMISIÓN (TX)", labelRtd: "RTD (Pt100)", labelLm35: "Sensor Analógico (LM35)",
        labelFreq: "Frecuencia Portadora", labelVolt: "Voltaje Rampa (Vpp)", btnAutoset: "AUTOSET SISTEMA",
        labelAvgTemp: "TEMPERATURA PROMEDIO (°C)", labelNoise: "Interferencia Óptica (Ruido)",
        labelRx: "RECEPCIÓN Y CONTROL (RX)", labelFan: "EXTRACTOR", labelVrec: "V_RECUPERADO (POST-FILTRO)",
        labelAnalysis: "Análisis de la Cadena", labelScope: "OSCILOSCOPIO TX (PWM) vs RX (REC)",
        labelTutor: "PREGUNTA A RIGOBERTO", labelBlue: "AZUL", labelGreen: "VERDE", labelRed: "ROJO",
        btnPause: "PAUSAR", btnResume: "REANUDAR", labelBadge: "Electrónica Análoga - Simón Barrera R., Laura Guerrero R., Karen Marulanda C.",
        supTitle: "Centro Multimedia del Grupo",
        supInfoT: "Infografía del Proyecto",
        supPdfT: "Presentación Ejecutiva", supPdfD: "Slides detallados sobre el diseño y simulación en PDF.",
        supAudioT: "Podcast Técnico", supVideoT: "Video Explicativo",
        btnView: "👁️ Ver", btnDownload: "💾 Descargar",
        analysisItems: [
            "<b>1. Captura:</b> Promedio de sensores convertido a 0.1V/°C.",
            "<b>2. TX PWM:</b> Modulación del nivel DC contra la rampa de 100Hz.",
            "<b>3. Enlace IR:</b> Transmisión óptica binaria (encendido/apagado).",
            "<b>4. RX Filtro:</b> El filtro Sallen-Key recupera el nivel DC original.",
            "<b>5. Control:</b> Comparadores de ventana activan la carga final."
        ],
        tutorIntro: "Hola, pregúntame sobre cualquier parte técnica del sistema.",
        paths: {
            info: "../../Contenido de apoyo del grupo/Infografía en Español.png",
            pdf: "../../Contenido de apoyo del grupo/Telemetría_Térmica_PWM-IR.pdf",
            audio: "../../Contenido de apoyo del grupo/Control_de_calderas_con_luz_infrarroja.m4a",
            video: "../../Contenido de apoyo del grupo/Telemetría_Térmica_PWM-IR.mp4"
        }
    },
    en: {
        titleMain: "Thermal Telemetry & PWM-IR Control",
        titleSub: "Laboratory #3: Op-Amp Design",
        ctxTitle: "Laboratory Objective",
        ctxDesc1: "This simulation represents an industrial wireless monitoring system. The goal is to process temperature from two points (RTD and LM35) and transmit it via <b>optical telemetry (Infrared)</b> using PWM.",
        ctxHint: "Technical Note:", ctxHintDesc: "'Optical Noise' simulates external light interference.",
        labelTx: "TRANSMISSION (TX)", labelRtd: "RTD (Pt100)", labelLm35: "Analog Sensor (LM35)",
        labelFreq: "Carrier Frequency", labelVolt: "Ramp Voltage (Vpp)", btnAutoset: "SYSTEM AUTOSET",
        labelAvgTemp: "AVERAGE TEMPERATURE (°C)", labelNoise: "Optical Interference (Noise)",
        labelRx: "RECEPTION AND CONTROL (RX)", labelFan: "EXTRACTOR", labelVrec: "V_RECOVERED (POST-FILTER)",
        labelAnalysis: "Chain Analysis", labelScope: "TX (PWM) vs RX (REC) OSCILLOSCOPE",
        labelTutor: "ASK RIGOBERTO", labelBlue: "BLUE", labelGreen: "GREEN", labelRed: "RED",
        btnPause: "PAUSE", btnResume: "RESUME", labelBadge: "Analog Electronics - Simón Barrera R., Laura Guerrero R., Karen Marulanda C.",
        supTitle: "Group Multimedia Center",
        supInfoT: "Project Infographic",
        supPdfT: "Executive Presentation", supPdfD: "Detailed slides on design and simulation in PDF format.",
        supAudioT: "Technical Podcast", supVideoT: "Explanatory Video",
        btnView: "👁️ View", btnDownload: "💾 Download",
        analysisItems: [
            "<b>1. Capture:</b> Sensor average converted to 0.1V/°C.",
            "<b>2. TX PWM:</b> DC level modulation against the 100Hz ramp.",
            "<b>3. IR Link:</b> Binary optical transmission (on/off).",
            "<b>4. RX Filter:</b> Sallen-Key filter recovers the original DC level.",
            "<b>5. Control:</b> Window comparators activate the final load."
        ],
        tutorIntro: "Hello, ask me about any technical part of the system.",
        paths: {
            info: "../../Contenido de apoyo del grupo/Infografía en Inglés.png",
            pdf: "../../Contenido de apoyo del grupo/PWM-IR_Telemetry_Architecture.pdf",
            audio: "../../Contenido de apoyo del grupo/Replacing_Copper_Wires_With_Infrared_Light.m4a",
            video: "../../Contenido de apoyo del grupo/Thermal_Telemetry_System.mp4"
        }
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    applyLanguage();
}

function applyLanguage() {
    const t = TRANSLATIONS[currentLang];
    document.getElementById('title-main').innerText = t.titleMain;
    document.getElementById('title-sub').innerText = t.titleSub;
    document.getElementById('ctx-title').innerText = t.ctxTitle;
    document.getElementById('ctx-desc-1').innerHTML = t.ctxDesc1;
    document.getElementById('ctx-hint').innerText = t.ctxHint;
    document.getElementById('ctx-hint-desc').innerText = t.ctxHintDesc;
    document.getElementById('label-tx').innerText = t.labelTx;
    document.getElementById('label-rtd').innerText = t.labelRtd;
    document.getElementById('label-lm35').innerText = t.labelLm35;
    document.getElementById('label-freq').innerText = t.labelFreq;
    document.getElementById('label-volt').innerText = t.labelVolt;
    document.getElementById('btn-autoset').innerText = t.btnAutoset;
    document.getElementById('label-avg-temp').innerText = t.labelAvgTemp;
    document.getElementById('label-noise').innerText = t.labelNoise;
    document.getElementById('label-rx').innerText = t.labelRx;
    document.getElementById('label-fan').innerText = t.labelFan;
    document.getElementById('led-blue').innerText = t.labelBlue;
    document.getElementById('led-green').innerText = t.labelGreen;
    document.getElementById('led-red').innerText = t.labelRed;
    document.getElementById('label-vrec').innerText = t.labelVrec;
    document.getElementById('label-analysis').innerText = t.labelAnalysis;
    document.getElementById('label-scope').innerText = t.labelScope;
    document.getElementById('label-tutor').innerText = t.labelTutor;
    document.getElementById('badge-authors').innerText = t.labelBadge;
    document.getElementById('pause-btn').innerText = isPaused ? t.btnResume : t.btnPause;
    document.getElementById('tutor-intro').innerText = t.tutorIntro;

    const analysisBox = document.getElementById('analysis-text');
    analysisBox.innerHTML = t.analysisItems.map(item => `<div class="analysis-item">${item}</div>`).join('');

    // Multimedia Center
    document.getElementById('support-main-title').innerText = t.supTitle;
    document.getElementById('sup-info-title').innerText = t.supInfoT;
    document.getElementById('sup-info-img').src = t.paths.info;
    document.getElementById('sup-info-dl').href = t.paths.info;
    document.getElementById('sup-info-dl').innerText = t.btnDownload;

    document.getElementById('sup-pdf-title').innerText = t.supPdfT;
    document.getElementById('sup-pdf-desc').innerText = t.supPdfD;
    document.getElementById('sup-pdf-link').href = t.paths.pdf;
    document.getElementById('sup-pdf-link').innerText = t.btnView;
    document.getElementById('sup-pdf-dl').href = t.paths.pdf;
    document.getElementById('sup-pdf-dl').innerText = t.btnDownload;

    document.getElementById('sup-audio-title').innerText = t.supAudioT;
    document.getElementById('sup-audio-player').src = t.paths.audio;
    document.getElementById('sup-audio-dl').href = t.paths.audio;
    document.getElementById('sup-audio-dl').innerText = t.btnDownload;

    document.getElementById('sup-video-title').innerText = t.supVideoT;
    document.getElementById('sup-video-player').src = t.paths.video;
    document.getElementById('sup-video-dl').href = t.paths.video;
    document.getElementById('sup-video-dl').innerText = t.btnDownload;
}

function updateSystem() {
    tempRTD = parseFloat(document.getElementById('temp-rtd').value);
    tempLM35 = parseFloat(document.getElementById('temp-lm35').value);
    freqTri = parseFloat(document.getElementById('freq-tri').value);
    voltTri = parseFloat(document.getElementById('volt-tri').value);
    optNoise = parseFloat(document.getElementById('opt-noise').value);
    avgTemp = (tempRTD + tempLM35) / 2;
    vAdecuado = avgTemp * 0.1;
    let recoveryFactor = (voltTri > vAdecuado) ? 0.98 : (voltTri / vAdecuado) * 0.5;
    vRecuperado = vAdecuado * recoveryFactor;
    updateUI();
}

function updateUI() {
    document.getElementById('val-rtd').innerText = tempRTD.toFixed(1);
    document.getElementById('val-lm35').innerText = tempLM35.toFixed(1);
    document.getElementById('val-freq').innerText = freqTri;
    document.getElementById('val-volt').innerText = voltTri.toFixed(1);
    document.getElementById('temp-display').innerText = avgTemp.toFixed(1);
    document.getElementById('val-vrec').innerText = vRecuperado.toFixed(2) + " V";
    document.getElementById('bar-vrec').style.width = (vRecuperado / 6 * 100) + "%";
    const isCold = avgTemp < 25, isNormal = avgTemp >= 25 && avgTemp <= 35, isHot = avgTemp > 35;
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
    const t = TRANSLATIONS[currentLang];
    document.getElementById('pause-btn').innerText = isPaused ? t.btnResume : t.btnPause;
    document.getElementById('pause-btn').style.background = isPaused ? "#e67e22" : "#333";
}

function getSignals(t) {
    const f = freqTri, amp = voltTri;
    const vTri = amp * (Math.abs(2 * (f * t - Math.floor(f * t + 0.5))));
    const pwm = (amp > 0.1 && vAdecuado > vTri) ? 5 : 0;
    const noise = (Math.random() - 0.5) * optNoise * 3;
    const rizado = 0.04 * Math.sin(2 * Math.PI * f * t);
    const rec = (voltTri > 0.1) ? vRecuperado + rizado + noise : 0;
    return { pwm, rec, vTri };
}

function draw(now) {
    if (!isPaused) {
        const delta = (now - lastTime) / 1000;
        lastTime = now;
        tOffset += delta * 0.08;
        if (canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width, h = canvas.height, timeWin = 0.04;
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
            ctx.lineWidth = 1.5; ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = (x / w) * timeWin + tOffset;
                const { pwm } = getSignals(t);
                const y = h/2.5 - (pwm * (h/20)); 
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2; ctx.beginPath();
            for (let x = 0; x < w; x++) {
                const t = (x / w) * timeWin + tOffset;
                const { rec } = getSignals(t);
                const y = h * 0.8 - (rec * (h/10)); 
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        const wave = document.getElementById('photon-wave');
        if (wave) {
            const { pwm: currentPwm } = getSignals(performance.now()/1000);
            if (currentPwm > 0 && voltTri > 0.5) {
                wave.style.opacity = (voltTri / 10) * (1 - optNoise);
                wave.style.left = ( (Date.now() % 1000) / 1000 * 100 ) + "%";
            } else { wave.style.opacity = 0; }
        }
    }
    requestAnimationFrame(draw);
}

async function askRigoberto() {
    const input = document.getElementById('user-input');
    const text = input.value; if (!text) return;
    chatBox.innerHTML += `<p><b>${currentLang === 'es' ? 'Tú' : 'You'}:</b> ${text}</p>`;
    input.value = ''; chatBox.scrollTop = chatBox.scrollHeight;
    const context = `LAB 3: Temp=${avgTemp}C, Freq=${freqTri}Hz, Volt=${voltTri}V. Lang=${currentLang}.`;
    try {
        const r = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: [
                    { role: "system", content: `You are Rigoberto. Respond in ${currentLang === 'es' ? 'Spanish' : 'English'} plain text.` },
                    { role: "user", content: text + " (Context: " + context + ")" }
                ] 
            })
        });
        const d = await r.json();
        chatBox.innerHTML += `<p><b>Rigoberto:</b> ${d.choices[0].message.content}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) { chatBox.innerHTML += `<p><i>Error.</i></p>`; }
}

window.onload = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    lastTime = performance.now();
    applyLanguage(); updateSystem(); draw(lastTime);
};

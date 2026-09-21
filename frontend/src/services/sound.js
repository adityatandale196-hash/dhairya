function createContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
        return null;
    }
    return new AudioCtx();
}

export function createSiren() {
    let ctx = null;
    let osc = null;
    let lfo = null;

    return {
        start() {
            if (ctx) {
                return;
            }
            ctx = createContext();
            if (!ctx) {
                return;
            }
            ctx.resume();

            osc = ctx.createOscillator();
            lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const volume = ctx.createGain();

            osc.type = "sawtooth";
            osc.frequency.value = 1000;
            lfo.frequency.value = 1.2;
            lfoGain.gain.value = 400;
            volume.gain.value = 0.6;

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            osc.connect(volume);
            volume.connect(ctx.destination);

            osc.start();
            lfo.start();
        },

        stop() {
            if (!ctx) {
                return;
            }
            try {
                osc.stop();
                lfo.stop();
            } catch {
                // already stopped
            }
            ctx.close();
            ctx = null;
            osc = null;
            lfo = null;
        },
    };
}

export function createRingtone() {
    let ctx = null;
    let osc = null;
    let gain = null;
    let timer = null;

    return {
        // Call this from a button click so the browser allows sound later
        prepare() {
            if (!ctx) {
                ctx = createContext();
            }
            if (ctx) {
                ctx.resume();
            }
        },

        start() {
            if (!ctx) {
                ctx = createContext();
            }
            if (!ctx || osc) {
                return;
            }
            ctx.resume();

            osc = ctx.createOscillator();
            gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = 480;
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            let ringing = false;
            const toggle = () => {
                ringing = !ringing;
                gain.gain.value = ringing ? 0.5 : 0;
            };
            toggle();
            timer = setInterval(toggle, 1000);
        },

        stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
            if (osc) {
                try {
                    osc.stop();
                } catch {
                    // already stopped
                }
                osc = null;
            }
            if (ctx) {
                ctx.close();
                ctx = null;
            }
            gain = null;
        },
    };
}
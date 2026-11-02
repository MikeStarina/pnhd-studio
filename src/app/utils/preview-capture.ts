type TCapture = (view: string) => Promise<boolean>;

let capture: TCapture | null = null;
let registeredView: string | null = null;
let sceneRevealed = false;
const sceneWaiters: Array<() => void> = [];

export const resetSceneRevealed = () => {
    sceneRevealed = false;
};

export const markSceneRevealed = () => {
    sceneRevealed = true;
    const pending = sceneWaiters.splice(0);
    pending.forEach((resolve) => resolve());
};

export const whenSceneRevealed = () => {
    if (sceneRevealed) return Promise.resolve();
    return new Promise<void>((resolve) => {
        sceneWaiters.push(resolve);
    });
};

export const registerPreviewCapture = (view: string, fn: TCapture) => {
    registeredView = view;
    capture = fn;
    return () => {
        if (capture === fn) {
            capture = null;
            registeredView = null;
        }
    };
};

export const captureRegisteredPreview = (view: string) => {
    if (!capture || registeredView !== view) return Promise.resolve(false);
    return capture(view);
};

export const waitForRegisteredPreview = (view: string, timeoutMs = 8000) => {
    const started = Date.now();
    return new Promise<boolean>((resolve) => {
        const tick = () => {
            if (registeredView === view && capture) {
                void capture(view).then(resolve);
                return;
            }
            if (Date.now() - started > timeoutMs) {
                resolve(false);
                return;
            }
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });
};

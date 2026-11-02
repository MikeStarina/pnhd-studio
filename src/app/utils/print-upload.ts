export type TPrintUploadBody = {
    message: string;
    url: string;
    name: string;
    width: number;
    height: number;
};

const localPrintUrls = new Map<string, string>();

export const rememberLocalPrint = (remoteUrl: string, file: Blob) => {
    const objectUrl = URL.createObjectURL(file);
    const previous = localPrintUrls.get(remoteUrl);
    if (previous) URL.revokeObjectURL(previous);
    localPrintUrls.set(remoteUrl, objectUrl);
    return objectUrl;
};

export const localPrintUrl = (remoteUrl: string) => localPrintUrls.get(remoteUrl);

export const printUploadFormData = (file: Blob, filename: string) => {
    const data = new FormData();
    data.append("files", file, filename);
    return data;
};

export const readPrintUpload = (result: unknown): TPrintUploadBody | null => {
    if (!result || typeof result !== "object" || !("data" in result)) return null;
    const body = (result as { data?: unknown }).data;
    if (!body || typeof body !== "object") return null;
    const record = body as Record<string, unknown>;
    if (typeof record.url !== "string" || !record.url) return null;
    return {
        message: typeof record.message === "string" ? record.message : "",
        url: record.url,
        name: typeof record.name === "string" ? record.name : "",
        width: typeof record.width === "number" ? record.width : 0,
        height: typeof record.height === "number" ? record.height : 0,
    };
};

export const captureCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
        try {
            const copy = document.createElement("canvas");
            copy.width = canvas.width;
            copy.height = canvas.height;
            const context = copy.getContext("2d");
            if (!context) {
                resolve(null);
                return;
            }
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, copy.width, copy.height);
            context.drawImage(canvas, 0, 0);
            copy.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
        } catch {
            resolve(null);
        }
    });
};

export const waitForPaint = (delayMs = 200) => {
    return new Promise<void>((resolve) => {
        window.setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => resolve());
            });
        }, delayMs);
    });
};

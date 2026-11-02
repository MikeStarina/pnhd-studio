import { ICartOrderElement, IPrintFile } from "./types";

const LEGACY_SIDES = ["front", "back", "lsleeve", "rsleeve"] as const;

type TLegacyPrint = IPrintFile & { preview?: string };

export const normalizeCartOrder = (order: ICartOrderElement[]): ICartOrderElement[] => {
    return order.map((elem) => {
        const raw = elem.prints as unknown;
        if (!raw) return { ...elem, prints: elem.prints ?? [] };
        if (Array.isArray(raw)) {
            const prints = raw
                .filter((print: IPrintFile) => print?.file?.url)
                .map((print: IPrintFile, index: number) => ({
                    ...print,
                    id: print.id || `print-${index}`,
                }));
            return { ...elem, prints };
        }
        const legacy = raw as Record<string, TLegacyPrint | undefined>;
        const prints: IPrintFile[] = [];
        LEGACY_SIDES.forEach((side) => {
            const print = legacy[side];
            if (!print?.file?.url) return;
            prints.push({
                id: print.id || `legacy-${side}`,
                file: print.file,
                stageParams: print.stageParams,
                cartParams: print.cartParams
                    ? {
                        price: print.cartParams.price,
                        format: print.cartParams.format,
                        size: print.cartParams.size,
                    }
                    : undefined,
                needsPlacement: false,
            });
        });
        return { ...elem, prints };
    });
};

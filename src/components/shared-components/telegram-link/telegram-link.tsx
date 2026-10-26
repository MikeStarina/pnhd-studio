'use client';

import React, { useEffect, useState } from 'react';

const TELEGRAM_BOT_URL = 'https://t.me/pnhd_studio_bot';

type RoistatWindow = Window & {
    roistat?: {
        visit?: string | number;
        getVisit?: () => string | number;
    };
};

function readRoistatVisitId(): string {
    if (typeof document === 'undefined') return '';

    const match = document.cookie.match(/(?:^|;\s*)roistat_visit=([^;]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);

    const roistat = (window as RoistatWindow).roistat;
    const visit = roistat?.getVisit?.() ?? roistat?.visit;
    return visit ? String(visit) : '';
}

export function getTelegramBotHref(): string {
    const visitId = readRoistatVisitId();
    return visitId ? `${TELEGRAM_BOT_URL}?start=v${encodeURIComponent(visitId)}` : TELEGRAM_BOT_URL;
}

type TelegramLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const TelegramLink: React.FC<TelegramLinkProps> = ({
    children,
    onClick,
    onPointerDown,
    onContextMenu,
    href: _href,
    target: _target,
    rel: _rel,
    ...rest
}) => {
    const [href, setHref] = useState(TELEGRAM_BOT_URL);

    useEffect(() => {
        const update = () => {
            const next = getTelegramBotHref();
            setHref(next);
            return next !== TELEGRAM_BOT_URL;
        };
        if (update()) return;

        const intervalId = window.setInterval(() => {
            if (update()) window.clearInterval(intervalId);
        }, 400);
        const timeoutId = window.setTimeout(() => window.clearInterval(intervalId), 30000);

        return () => {
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, []);

    const applyHref = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
        const next = getTelegramBotHref();
        if (event.currentTarget.href !== next) {
            event.currentTarget.href = next;
            setHref(next);
        }
    };

    return (
        <a
            {...rest}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(event) => {
                applyHref(event);
                onPointerDown?.(event);
            }}
            onContextMenu={(event) => {
                applyHref(event);
                onContextMenu?.(event);
            }}
            onClick={(event) => {
                applyHref(event);
                onClick?.(event);
            }}
        >
            {children}
        </a>
    );
};

export default TelegramLink;

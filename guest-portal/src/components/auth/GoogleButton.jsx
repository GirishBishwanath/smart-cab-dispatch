import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_ID = "google-identity-services";

const GoogleButton = ({ onSuccess, disabled = false }) => {
    const containerRef = useRef(null);
    const callbackRef = useRef(onSuccess);
    const lastWidthRef = useRef(0);

    const [ready, setReady] = useState(
        Boolean(window.google?.accounts?.id)
    );

    useEffect(() => {
        callbackRef.current = onSuccess;
    }, [onSuccess]);

    const loadGoogleScript = useCallback(() => {
        if (window.google?.accounts?.id) {
            setReady(true);
            return;
        }

        const existing = document.getElementById(SCRIPT_ID);

        if (existing) {
            existing.addEventListener("load", () => setReady(true), {
                once: true,
            });
            return;
        }

        const script = document.createElement("script");

        script.id = SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => setReady(true);

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        loadGoogleScript();
    }, [loadGoogleScript]);

    useEffect(() => {
        if (
            !ready ||
            disabled ||
            !import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            !containerRef.current
        ) {
            return;
        }

        const container = containerRef.current;

        const render = () => {
            const width = Math.min(
                container.clientWidth || 360,
                400
            );

            if (!width || width === lastWidthRef.current) {
                return;
            }

            lastWidthRef.current = width;
            container.innerHTML = "";

            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: (response) =>
                    callbackRef.current?.(response.credential),
                ux_mode: "popup",
            });

            window.google.accounts.id.renderButton(
                container,
                {
                    theme: "outline",
                    size: "large",
                    text: "continue_with",
                    shape: "rectangular",
                    width,
                }
            );
        };

        const frame = requestAnimationFrame(render);

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(render);
        });

        observer.observe(container);

        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            container.innerHTML = "";
            lastWidthRef.current = 0;
        };
    }, [ready, disabled]);

    return (
        <div
            ref={containerRef}
            className={`flex min-h-11 w-full justify-center ${
                disabled
                    ? "pointer-events-none opacity-60"
                    : ""
            }`}
        />
    );
};

export default GoogleButton;
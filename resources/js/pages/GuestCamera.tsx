import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    RefreshCw,
    VideoOff,
} from 'lucide-react';

/*
 * Guest clock-in page (no login). Same palette as the rest of the app.
 *   paper #F5F7FA  ink #101828  muted #475467 / #667085  line #E4E7EC
 *   green #0E7A5A  amber #F2B01E  red #D92D20
 */

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';
const mono = "font-['IBM_Plex_Mono']";

const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]';
const ghostBtn =
    'inline-flex items-center justify-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] shadow-sm transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50';

export default function GuestCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [code, setCode] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
        'user',
    );
    const [snapshot, setSnapshot] = useState<string | null>(null);
    const [snapshotBlob, setSnapshotBlob] = useState<Blob | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [now, setNow] = useState(new Date());

    /* Live clock */
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);

        return () => clearInterval(t);
    }, []);

    /* Camera start / stop */
    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        stopCamera();
        setCameraError(null);

        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError(
                'Camera is not supported. Open this page over HTTPS (or localhost).',
            );

            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraReady(true);
        } catch (err) {
            const name = (err as DOMException).name;

            setCameraError(
                name === 'NotAllowedError'
                    ? 'Camera permission was denied. Allow it in your browser settings.'
                    : name === 'NotFoundError'
                      ? 'No camera was found on this device.'
                      : 'Unable to start the camera.',
            );
        }
    }, [facingMode, stopCamera]);

    useEffect(() => {
        startCamera();

        return stopCamera;
    }, [startCamera, stopCamera]);

    /* Capture / retake */
    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth) {
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    return;
                }

                setMessage(null);
                setSnapshotBlob(blob);
                setSnapshot(URL.createObjectURL(blob));
            },
            'image/jpeg',
            0.85,
        );
    };

    const retake = () => {
        if (snapshot) {
            URL.revokeObjectURL(snapshot);
        }

        setSnapshot(null);
        setSnapshotBlob(null);
    };

    /* Submit: server decides clock in vs out */
    const submit = () => {
        if (!snapshotBlob) {
            return;
        }

        if (!code.trim()) {
            setMessage({ type: 'error', text: 'Enter your employee code.' });

            return;
        }

        setSubmitting(true);
        setMessage(null);

        router.post(
            '/clock-in',
            {
                employee_code: code.trim(),
                photo: new File([snapshotBlob], 'punch.jpg', {
                    type: 'image/jpeg',
                }),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (
                        page.props as { flash?: { status?: string } }
                    ).flash;

                    retake();
                    setCode('');
                    setMessage({
                        type: 'success',
                        text: flash?.status ?? 'Attendance recorded.',
                    });
                },
                onError: (errors) => {
                    setMessage({
                        type: 'error',
                        text:
                            errors.punch ??
                            errors.employee_code ??
                            errors.photo ??
                            'Something went wrong. Please try again.',
                    });
                },
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const mirrored = facingMode === 'user' ? '-scale-x-100' : '';

    return (
        <>
            <Head title="Clock in">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-screen bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-2xl space-y-6 px-6 py-8">
                    {/* Top bar */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm text-[#475467] hover:text-[#101828]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>

                        <div className="flex items-center gap-2.5">
                            <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-[#0E7A5A] ${mono} text-sm font-medium text-white`}
                            >
                                ₱
                            </span>
                            <span className="text-lg font-semibold">
                                SmartPayroll
                            </span>
                        </div>
                    </div>

                    {/* Clock */}
                    <div className="text-center">
                        <p className={`${mono} text-4xl font-medium`}>
                            {now.toLocaleTimeString('en-US', { hour12: false })}
                        </p>
                        <p className="mt-1 text-sm text-[#667085]">
                            {now.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className={`${card} overflow-hidden`}>
                        <div className="border-b border-[#E4E7EC] px-5 py-4">
                            <h1 className="text-base font-semibold">
                                Clock in / out
                            </h1>
                            <p className="mt-1 text-xs text-[#667085]">
                                Enter your employee code, then take a photo
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            {message && (
                                <div
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                                        message.type === 'success'
                                            ? 'bg-[#D1FADF] text-[#05603A]'
                                            : 'bg-[#FEE4E2] text-[#B42318]'
                                    }`}
                                >
                                    {message.type === 'success' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    {message.text}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="employee_code"
                                    className="text-xs font-medium text-[#344054]"
                                >
                                    Employee code
                                </label>
                                <input
                                    id="employee_code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    disabled={submitting}
                                    autoComplete="off"
                                    placeholder="e.g. EMP-0001"
                                    className={`mt-1.5 w-full rounded-xl border border-[#D0D5DD] bg-white px-3.5 py-2.5 ${mono} text-sm uppercase placeholder:normal-case placeholder:text-[#98A2B3] focus:border-[#0E7A5A] focus:outline-none focus:ring-2 focus:ring-[#0E7A5A]/20`}
                                />
                            </div>

                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#101828]">
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className={`h-full w-full object-cover ${mirrored} ${snapshot ? 'hidden' : ''}`}
                                />

                                {snapshot && (
                                    <img
                                        src={snapshot}
                                        alt="Captured"
                                        className={`h-full w-full object-cover ${mirrored}`}
                                    />
                                )}

                                {cameraReady && !snapshot && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="aspect-[3/4] h-3/4 rounded-[50%] border-2 border-dashed border-white/60" />
                                    </div>
                                )}

                                {!cameraReady && !snapshot && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                                        <VideoOff className="h-8 w-8 text-white/70" />
                                        <p className="text-sm text-white/80">
                                            {cameraError ?? 'Starting camera…'}
                                        </p>
                                        {cameraError && (
                                            <button
                                                type="button"
                                                onClick={startCamera}
                                                className={ghostBtn}
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Try again
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <canvas ref={canvasRef} className="hidden" />

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFacingMode((m) =>
                                            m === 'user'
                                                ? 'environment'
                                                : 'user',
                                        )
                                    }
                                    disabled={!!snapshot || submitting}
                                    className={ghostBtn}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Switch camera
                                </button>

                                {!snapshot ? (
                                    <button
                                        type="button"
                                        onClick={capture}
                                        disabled={!cameraReady}
                                        className={primaryBtn}
                                    >
                                        <Camera className="h-4 w-4" />
                                        Capture photo
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={retake}
                                            disabled={submitting}
                                            className={ghostBtn}
                                        >
                                            Retake
                                        </button>
                                        <button
                                            type="button"
                                            onClick={submit}
                                            disabled={submitting}
                                            className={primaryBtn}
                                        >
                                            {submitting
                                                ? 'Saving…'
                                                : 'Confirm'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
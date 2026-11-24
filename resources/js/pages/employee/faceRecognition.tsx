import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
    Camera,
    Check,
    RefreshCw,
    ScanFace,
    ShieldCheck,
    VideoOff,
} from 'lucide-react';

/*
 * Same palette as dashboard.tsx / attendance
 *   paper #F5F7FA  ink #101828  muted #475467 / #667085  line #E4E7EC
 *   green #0E7A5A  amber #F2B01E  red #D92D20
 */

const breadcrumbs: BreadcrumbItem[] = [
    // { title: 'Dashboard', href: '/dashboard' },
    // { title: 'Face registration', href: '/face-registration' },
];

/* Samples are taken from slightly different angles so recognition
 * still works with hair, glasses, lighting or head tilt changes. */
const POSES = [
    { key: 'front', title: 'Look straight', hint: 'Face the camera' },
    { key: 'left', title: 'Turn left', hint: 'Turn your head slightly left' },
    {
        key: 'right',
        title: 'Turn right',
        hint: 'Turn your head slightly right',
    },
    { key: 'up', title: 'Chin up', hint: 'Tilt your chin up a little' },
    { key: 'down', title: 'Chin down', hint: 'Tilt your chin down a little' },
] as const;

interface Shot {
    url: string;
    blob: Blob;
}

interface Props {
    /** True if this employee already has a face enrolled */
    registered?: boolean;
    /** ISO date string of the last registration */
    registeredAt?: string | null;
}

const card =
    'rounded-2xl border border-[#E4E7EC] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_12px_32px_-12px_rgba(16,24,40,0.1)]';
const cardHeader =
    'flex items-center justify-between border-b border-[#E4E7EC] px-5 py-4';
const mono = "font-['IBM_Plex_Mono']";

const primaryBtn =
    'inline-flex items-center justify-center gap-2 rounded-full bg-[#0E7A5A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0B6249] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F7FA]';
const ghostBtn =
    'inline-flex items-center justify-center gap-2 rounded-full border border-[#D0D5DD] bg-white px-5 py-2.5 text-sm font-semibold text-[#344054] shadow-sm transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50';

export default function FaceRegistrationPage({
    registered = false,
    registeredAt = null,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [shots, setShots] = useState<(Shot | null)[]>(
        POSES.map(() => null),
    );
    const [active, setActive] = useState(0);
    const [flash, setFlash] = useState(false);
    const [consent, setConsent] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    /* Camera start / stop (front camera only) */
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
                    facingMode: 'user',
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
    }, [stopCamera]);

    useEffect(() => {
        startCamera();

        return stopCamera;
    }, [startCamera, stopCamera]);

    /* Revoke object URLs on unmount */
    const shotsRef = useRef<(Shot | null)[]>([]);
    shotsRef.current = shots;

    useEffect(() => {
        return () => {
            shotsRef.current.forEach((s) => s && URL.revokeObjectURL(s.url));
        };
    }, []);

    const taken = shots.filter(Boolean).length;
    const complete = taken === POSES.length;

    /* Capture the sample for the active pose */
    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth) {
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Saved unmirrored, so it matches what the camera sees at attendance
        canvas.getContext('2d')?.drawImage(video, 0, 0);

        setFlash(true);
        setTimeout(() => setFlash(false), 150);

        const index = active;

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    return;
                }

                setShots((prev) => {
                    const next = [...prev];

                    if (next[index]) {
                        URL.revokeObjectURL(next[index]!.url);
                    }

                    next[index] = { url: URL.createObjectURL(blob), blob };

                    // Jump to the next empty pose, if any
                    const nextEmpty = next.findIndex((s) => !s);

                    if (nextEmpty !== -1) {
                        setActive(nextEmpty);
                    }

                    return next;
                });
            },
            'image/jpeg',
            0.92,
        );
    };

    const resetAll = () => {
        shots.forEach((s) => s && URL.revokeObjectURL(s.url));
        setShots(POSES.map(() => null));
        setActive(0);
        setSubmitError(null);
    };

    /* Upload all samples to the backend */
    const submit = () => {
        if (!complete || !consent || processing) {
            return;
        }

        setProcessing(true);
        setSubmitError(null);

        const photos = shots.map(
            (s, i) =>
                new File([s!.blob], `${POSES[i].key}.jpg`, {
                    type: 'image/jpeg',
                }),
        );

        router.post(
            '/face-registration',
            { photos, poses: POSES.map((p) => p.key) },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDone(true);
                    stopCamera();
                },
                onError: (errors) => {
                    setSubmitError(
                        Object.values(errors)[0] ??
                            'Registration failed. Please try again.',
                    );
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const registeredLabel = registeredAt
        ? new Date(registeredAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Face registration">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700|ibm-plex-mono:400,500"
                    rel="stylesheet"
                />
            </Head>

            <div
                className="min-h-full bg-[#F5F7FA] font-['Instrument_Sans'] text-[#101828]"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)',
                    backgroundSize: '100% 32px',
                }}
            >
                <div className="mx-auto max-w-7xl space-y-6 p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Face registration
                            </h1>
                            <p className="mt-1 text-sm text-[#475467]">
                                {registered
                                    ? 'Re-register your face if attendance keeps failing to recognize you'
                                    : 'Register your face to clock in with face recognition'}
                            </p>
                        </div>

                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                                registered
                                    ? 'bg-[#D1FADF] text-[#05603A]'
                                    : 'bg-[#FEF0C7] text-[#93370D]'
                            }`}
                        >
                            <ScanFace className="h-3.5 w-3.5" />
                            {registered
                                ? `Registered${registeredLabel ? ` · ${registeredLabel}` : ''}`
                                : 'Not registered'}
                        </span>
                    </div>

                    {done && (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] p-4 text-sm text-[#05603A]">
                            <Check className="mt-0.5 h-4 w-4 shrink-0" />
                            <div>
                                <p className="font-semibold">
                                    Face registered
                                </p>
                                <p className="mt-0.5">
                                    Your new face data replaces the old one. You
                                    can now use it on the Attendance page.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        {/* Viewfinder */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold">
                                        {complete
                                            ? 'All samples taken'
                                            : POSES[active].title}
                                    </h2>
                                    <p className="mt-1 text-xs text-[#667085]">
                                        {complete
                                            ? 'Review the photos, then save'
                                            : POSES[active].hint}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                        cameraReady
                                            ? 'bg-[#D1FADF] text-[#05603A]'
                                            : 'bg-[#F2F4F7] text-[#475467]'
                                    }`}
                                >
                                    {cameraReady ? 'Live' : 'Off'}
                                </span>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#101828]">
                                    <video
                                        ref={videoRef}
                                        playsInline
                                        muted
                                        className="h-full w-full -scale-x-100 object-cover"
                                    />

                                    {/* Face guide */}
                                    {cameraReady && (
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="h-[78%] aspect-[3/4] rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_0_999px_rgba(16,24,40,0.45)]" />
                                        </div>
                                    )}

                                    {flash && (
                                        <div className="pointer-events-none absolute inset-0 bg-white/80" />
                                    )}

                                    {!cameraReady && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#101828] p-6 text-center">
                                            <VideoOff className="h-8 w-8 text-white/70" />
                                            <p className="text-sm text-white/80">
                                                {cameraError ??
                                                    (done
                                                        ? 'Camera stopped.'
                                                        : 'Starting camera…')}
                                            </p>
                                            {(cameraError || done) && (
                                                <button
                                                    type="button"
                                                    onClick={startCamera}
                                                    className={ghostBtn}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                    {done
                                                        ? 'Start camera'
                                                        : 'Try again'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <canvas ref={canvasRef} className="hidden" />

                                <ul className="list-disc space-y-1 pl-5 text-xs text-[#667085]">
                                    <li>Use good lighting, with light on your face, not behind you.</li>
                                    <li>Remove cap, mask and sunglasses.</li>
                                    <li>Keep your whole face inside the oval.</li>
                                </ul>

                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={capture}
                                        disabled={!cameraReady || processing}
                                        className={primaryBtn}
                                    >
                                        <Camera className="h-4 w-4" />
                                        {shots[active]
                                            ? 'Retake photo'
                                            : 'Capture photo'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Samples + submit */}
                        <div className={`${card} overflow-hidden`}>
                            <div className={cardHeader}>
                                <div>
                                    <h2 className="text-base font-semibold">
                                        Samples
                                    </h2>
                                    <p className="mt-1 text-xs text-[#667085]">
                                        {taken} of {POSES.length} taken
                                    </p>
                                </div>

                                {taken > 0 && (
                                    <button
                                        type="button"
                                        onClick={resetAll}
                                        disabled={processing}
                                        className="text-xs font-medium text-[#D92D20] hover:underline disabled:opacity-50"
                                    >
                                        Start over
                                    </button>
                                )}
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="grid grid-cols-2 gap-3">
                                    {POSES.map((pose, i) => {
                                        const shot = shots[i];
                                        const isActive = i === active;

                                        return (
                                            <button
                                                key={pose.key}
                                                type="button"
                                                onClick={() => setActive(i)}
                                                disabled={processing}
                                                className={`overflow-hidden rounded-xl border bg-[#F9FAFB] text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7A5A] ${
                                                    isActive
                                                        ? 'border-[#0E7A5A] ring-1 ring-[#0E7A5A]'
                                                        : 'border-[#E4E7EC] hover:border-[#D0D5DD]'
                                                }`}
                                            >
                                                {shot ? (
                                                    <img
                                                        src={shot.url}
                                                        alt={pose.title}
                                                        className="aspect-video w-full -scale-x-100 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex aspect-video w-full items-center justify-center bg-[#F2F4F7] text-[#98A2B3]">
                                                        <ScanFace className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between px-2.5 py-2">
                                                    <span className="text-xs font-medium text-[#344054]">
                                                        {pose.title}
                                                    </span>
                                                    {shot && (
                                                        <Check className="h-3.5 w-3.5 text-[#0E7A5A]" />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {registered && (
                                    <p className="rounded-xl bg-[#FFFAEB] px-3 py-2.5 text-xs text-[#93370D]">
                                        Saving will replace your current face
                                        data.
                                    </p>
                                )}

                                <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[#475467]">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) =>
                                            setConsent(e.target.checked)
                                        }
                                        className="mt-0.5 h-4 w-4 rounded border-[#D0D5DD] accent-[#0E7A5A]"
                                    />
                                    <span>
                                        I agree that my face data is stored and
                                        used only to verify my attendance.
                                    </span>
                                </label>

                                {submitError && (
                                    <p className="rounded-xl bg-[#FEF3F2] px-3 py-2.5 text-xs text-[#B42318]">
                                        {submitError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={
                                        !complete || !consent || processing
                                    }
                                    className={`${primaryBtn} w-full`}
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    {processing
                                        ? 'Saving…'
                                        : registered
                                          ? 'Save new face data'
                                          : 'Register face'}
                                </button>

                                <p
                                    className={`${mono} text-center text-[11px] text-[#98A2B3]`}
                                >
                                    {complete
                                        ? 'Ready to save'
                                        : `${POSES.length - taken} more to go`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
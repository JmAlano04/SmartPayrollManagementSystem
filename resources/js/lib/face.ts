/*
 * Face detection + 128-number face descriptor, running in the browser.
 * Models are served from /public/models (see README).
 */

type FaceApi = {
    nets: {
        tinyFaceDetector: { loadFromUri(uri: string): Promise<void> };
        faceLandmark68Net: { loadFromUri(uri: string): Promise<void> };
        faceRecognitionNet: { loadFromUri(uri: string): Promise<void> };
    };
    TinyFaceDetectorOptions: new (options: { inputSize: number; scoreThreshold: number }) => unknown;
    detectAllFaces: (
        source: HTMLVideoElement | HTMLCanvasElement,
        options: unknown,
    ) => {
        withFaceLandmarks: () => {
            withFaceDescriptors: () => Promise<Array<{
                detection: { box: { width: number } };
                descriptor: Float32Array;
            }>>;
        };
    };
};

let api: FaceApi | null = null;
let loading: Promise<void> | null = null;

export function loadFaceModels(): Promise<void> {
    if (!loading) {
        loading = (async () => {
            // Dynamic import keeps the heavy library out of the main bundle
            api = await import('@vladmandic/face-api');
            await Promise.all([
                api.nets.tinyFaceDetector.loadFromUri('/models'),
                api.nets.faceLandmark68Net.loadFromUri('/models'),
                api.nets.faceRecognitionNet.loadFromUri('/models'),
            ]);
        })().catch((e) => {
            loading = null; // allow retry
            throw e;
        });
    }

    return loading;
}

export type FaceResult =
    | { status: 'ok'; descriptor: number[] }
    | { status: 'none' | 'multiple' | 'small' };

export async function readFace(
    source: HTMLVideoElement | HTMLCanvasElement,
): Promise<FaceResult> {
    if (!api) {
        await loadFaceModels();
    }

    const faceapi = api!;
    const faces = await faceapi
        .detectAllFaces(
            source,
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.5,
            }),
        )
        .withFaceLandmarks()
        .withFaceDescriptors();

    if (faces.length === 0) {
        return { status: 'none' };
    }

    if (faces.length > 1) {
        return { status: 'multiple' };
    }

    const width =
        source instanceof HTMLVideoElement ? source.videoWidth : source.width;

    // Face must fill at least ~20% of the frame width
    if (faces[0].detection.box.width < width * 0.2) {
        return { status: 'small' };
    }

    return { status: 'ok', descriptor: Array.from(faces[0].descriptor) };
}

export const FACE_MESSAGES = {
    none: 'No face found. Face the camera with good lighting.',
    multiple: 'More than one face found. Only one person at a time.',
    small: 'Move closer to the camera.',
} as const;
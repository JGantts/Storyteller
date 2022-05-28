type Nullable<T> = T | null | undefined
type BlkProgressCallback = (p0: number, p1: number, p2: number) => Nullable<boolean>;
export function loadBackground(
    absolutePath: string,
    progressCallback: Nullable<BlkProgressCallback>
): kotlin.js.Promise<Int8Array>;
export function loadBackgroundWithProgressChunkSize(
    absolutePath: string,
    progressChunkSize: number,
    progressCallback: Nullable<BlkProgressCallback>
): kotlin.js.Promise<Int8Array>;
export as namespace NodeBLKLoader;
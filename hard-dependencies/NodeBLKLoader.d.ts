type Nullable<T> = T | null | undefined
type BlkProgressCallback = (p0: number, p1: number, p2: number) => Nullable<boolean>;

/**
 * Loads, parses and stitches a BLK from an absolute path, returning the raw bytes to the stitched PNG
 * @param absolutePath
 * @param progressCallback
 */
export function loadBackground(
    absolutePath: string,
    progressCallback: Nullable<BlkProgressCallback>
): kotlin.js.Promise<Int8Array>;

/**
 * Gets the dimensions of a BLK without actually loading it first
 * @param absolutePath
 */
export function getBLKDimensions(absolutePath: string): {width: number, height: number};


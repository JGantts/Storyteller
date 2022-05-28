type Nullable<T> = T | null | undefined
export function loadBackground(absolutePath: string, progressCallback: Nullable<(p0: number, p1: number, p2: number) => Nullable<boolean>>): kotlin.js.Promise<Int8Array>;
export as namespace NodeBLKLoader;


function getSortedId(idA: string, idB: string) {
    if (idA > idB) {
        return "" + idA + "-" + idB;
    } else {
        return "" + idB + "-" + idA;
    }
}

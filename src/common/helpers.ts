/**
 *
 *
 * @export
 * @interface IRect
 */
export interface IRect { left: number; right: number; bottom: number; top: number; }

/**
 *
 *
 * @export
 * @param {Date} date
 * @returns
 */
export function toTimestamp(date: Date): number {
    const newDate = new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0, 0, 0, 0,
    );
    return Math.ceil((newDate.getTime() + -(newDate.getTimezoneOffset() * 60000)) / 1000);
}

/**
 *
 *
 * @export
 * @doc http://processingjs.org/reference/lerp_/
 * @param {number} start
 * @param {number} end
 * @param {number} amount - between 0.0 and 1.0
 * @returns
 */
export function lerp(start: number, end: number, amount: number): number {
    return (1 - amount) * start + amount * end;
}

/**
 * random number
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Degree to Radians
 *
 * @export
 * @param {number} degree
 * @returns {number}
 */
export function toRad(degree: number): number {
    return degree * Math.PI / 180;
}

/**
 * Radians to Degree
 *
 * @export
 * @param {number} rad
 * @returns {number}
 */
export function toDegree(rad: number): number {
    return rad * 180 / Math.PI;
}

/**
 * intersect between 2 rectangle
 *
 * @export
 * @param {IRect} r1
 * @param {IRect} r2
 * @returns {boolean}
 */
export function intersectRect(r1: IRect, r2: IRect): boolean {
    return !(r2.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top);
}

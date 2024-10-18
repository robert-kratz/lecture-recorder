/**
 * Converts milliseconds to a time string 00:00:00 or 00:00
 * @param timeString  The time string to convert
 * @returns
 */
export function timeStringToMilliseconds(timeString: string): number {
    const timeParts = timeString.split(':').map(Number);
    let milliseconds = 0;

    if (timeParts.length === 3) {
        // Format hh:mm:ss
        const hours = timeParts[0];
        const minutes = timeParts[1];
        const seconds = timeParts[2];
        milliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000;
    } else if (timeParts.length === 2) {
        // Format mm:ss
        const minutes = timeParts[0];
        const seconds = timeParts[1];
        milliseconds = (minutes * 60 + seconds) * 1000;
    } else if (timeParts.length === 1) {
        // Format ss
        const seconds = timeParts[0];
        milliseconds = seconds * 1000;
    }

    return milliseconds;
}

export const calculateExpiredTime = (
    expirySeconds: number,
    startTime = Math.floor(Date.now() / 1000)
) => {
    return startTime + expirySeconds
}
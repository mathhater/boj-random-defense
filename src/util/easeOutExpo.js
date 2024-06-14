export const easeOutExpo = (x) => {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}
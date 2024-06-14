export const getLevelByRating = (rating) => {
  return Math.ceil((rating + 0.5) / 100)
}
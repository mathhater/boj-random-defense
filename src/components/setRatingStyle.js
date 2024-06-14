import { getLevelByRating } from '../util/level/ratingToLevel.js'
import { getLevelColor } from '../util/level/color.js'

export const setRatingStyle = (ratingElement, rating) => {
  const level = getLevelByRating(rating)
  ratingElement.style.color = getLevelColor(level)
  if (rating >= 3000) {
    ratingElement.style.backgroundColor = 'rgb(180, 145, 255)'
    ratingElement.style.backgroundImage = 'linear-gradient(0deg, rgb(255, 124, 168), rgb(180, 145, 255), rgb(124, 249, 255))'
    ratingElement.style.backgroundSize = '80%'
    ratingElement.style.backgroundRepeat = 'repeat'
    ratingElement.style.backgroundClip = 'text'
    ratingElement.style.webkitTextFillColor = 'transparent'
  }
}
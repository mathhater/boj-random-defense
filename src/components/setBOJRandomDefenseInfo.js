import { setRatingStyle } from './setRatingStyle.js'

export const setBOJRandomDefenseInfo = (rating) => {
  const userRatingElement = document.getElementById('user-rating')

  chrome.storage.local.set({ rating })
  userRatingElement.innerText = String(rating)
  setRatingStyle(userRatingElement, rating)
}
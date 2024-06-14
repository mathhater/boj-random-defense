import {
  STATIC_SOLVEDAC_URL,
  BOJ_RANDOM_DEFENSE_CLIENT_URL,
} from '../util/constants.js'

export const setSolvedacInfo = (tier, handle) => {
  const tierImgElement = document.getElementById('tier-img')
  const userHandleElement = document.getElementById('user-handle')

  chrome.storage.local.set({ handle, tier })
  tierImgElement.src = `${STATIC_SOLVEDAC_URL}/tier_small/${tier}.svg`
  userHandleElement.innerText = handle
  userHandleElement.href = `${BOJ_RANDOM_DEFENSE_CLIENT_URL}/${handle}`
}
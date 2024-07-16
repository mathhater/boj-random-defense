import {
  SOLVEDAC_COOKIE_URL,
  BOJ_RANDOM_DEFENSE_COOKIE_URL,
} from '../util/constants.js'

export const getAccessToken = async () => {
  const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
  const cookie = cookies[0]
  return cookie
}

export const getRefreshToken = async () => {
  const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'refreshToken' })
  const cookie = cookies[0]
  return cookie
}

export const getSolvedacToken = async () => {
  const cookies = await chrome.cookies.getAll({ domain: `.${SOLVEDAC_COOKIE_URL}`, name: 'solvedacToken' })
  const cookie = cookies[0]
  return cookie
}

export const removeAccessToken = async () => {
  await chrome.cookies.remove({
    url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
    name: 'accessToken',
  })
}

export const removeRefreshToken = async () => {
  await chrome.cookies.remove({
    url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
    name: 'refreshToken',
  })
}

export const isCookieValid = (cookie) => {
  return cookie && cookie.expirationDate * 1000 > new Date().getTime()
}
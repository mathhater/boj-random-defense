import {
  BOJ_RANDOM_DEFENSE_CLIENT_URL,
  APP_STATUS,
  USER_STATUS,
  TEN_MINUTE_ALARM
} from '../util/constants.js'

let userStatus = USER_STATUS.UNAUTHORIZED
let appStatus = APP_STATUS.NONE

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension install!')
    chrome.storage.local.set({ userStatus })

    chrome.storage.local.set({ userStatus })
    chrome.storage.local.set({ handle: '' })
    chrome.storage.local.set({ tier: 0 })
    chrome.storage.local.set({ rating: 0 })
    chrome.storage.local.set({ code: '' })
    chrome.storage.local.set({ codeCreatedAt: '' })
    chrome.storage.local.set({ lowLevel: 11 })
    chrome.storage.local.set({ highLevel: 11 })

    chrome.storage.sync.set({ appStatus })

    chrome.tabs.create({
      url: `${BOJ_RANDOM_DEFENSE_CLIENT_URL}/join`,
    });
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TEN_MINUTE_ALARM) {
    chrome.notifications.clear(alarm.name)
    chrome.notifications.create({
      type: 'basic',
      title: "10 minutes left",
      message: "If you solved the problem, Please press the button Solve!",
      iconUrl: '../images/32.png',
    })
  }
})
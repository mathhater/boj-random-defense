import {
  USER_STATUS,
  APP_STATUS,
  DEFENSE_TYPE,
  STATIC_SOLVEDAC_URL,
  ACMICPC_URL,
  SOLVEDAC_COOKIE_URL,
  BOJ_RANDOM_DEFENSE_COOKIE_URL,
  TEN_MINUTE_ALARM,
} from '../util/constants.js'
import { getLevelColor } from '../util/level/color.js'
import { getLevelText } from '../util/level/text.js'
import { easeOutExpo } from '../util/easeOutExpo.js'
import { setSolvedacInfo } from '../components/setSolvedacInfo.js'
import { setBOJRandomDefenseInfo } from '../components/setBOJRandomDefenseInfo.js'
import { setRatingStyle } from '../components/setRatingStyle.js'
import { setDefenseJoinButton } from '../components/setDefenseJoinButton.js'
import { setHeaderButtons } from '../components/setHeaderButtons.js'
import {
  fetchAccessToken,
  fetchAuthenticationCode,
  fetchCurrentProblem,
  fetchIsProblemSolved,
  fetchLogin,
  fetchLogout,
  fetchPass,
  fetchRangeDefense,
  fetchRankDefense,
  fetchRankDefenseLevel,
  fetchSolve,
  fetchSolvedacServerStatus,
  fetchSolvedacUserInfo,
  fetchUser,
  fetchUserWithToken,
  fetchVerifyCredentials
} from '../util/fetch.js'
import { messages } from '../util/messages.js'

let certificationIntervalStack = []
let problemIntervalStack = []

const setUserMode = async (mode) => {
  const loginBlockElement = document.getElementById('login-block')
  const userBlockElement = document.getElementById('user-block')
  const defenseInfoElement = document.getElementById('defense-info')
  const voidUserBlockElement = document.getElementById('void-user-block')

  loginBlockElement.style.display = 'none'
  userBlockElement.style.display = 'none'
  defenseInfoElement.style.display = 'none'
  switch (mode) {
    case USER_STATUS.UNAUTHORIZED: {
      try {
        await setAppMode(APP_STATUS.NONE)
      } catch (error) {
        console.error(error)
      }
      chrome.storage.local.set({ userStatus: USER_STATUS.UNAUTHORIZED })
      loginBlockElement.style.display = 'flex'
      userBlockElement.style.display = 'none'
      voidUserBlockElement.style.display = 'none'
      break
    }
    case USER_STATUS.UNREGISTERED: {
      setHeaderButtons('refresh')
      try {
        const { appStatus } = await chrome.storage.sync.get(['appStatus'])
        await setAppMode(appStatus === APP_STATUS.CERTIFICATION ?
          APP_STATUS.CERTIFICATION :
          APP_STATUS.NONE
        )
        chrome.storage.local.set({ userStatus: USER_STATUS.UNREGISTERED })
        const { handle, tier } = await chrome.storage.local.get(['handle', 'tier'])
        setSolvedacInfo(tier, handle)
        setDefenseJoinButton(true)
        loginBlockElement.style.display = 'none'
        userBlockElement.style.display = 'flex'
        voidUserBlockElement.style.display = 'none'
      } catch (error) {
        console.error(error)
      }
      break
    }
    case USER_STATUS.REGISTERED: {
      try {
        const { appStatus } = await chrome.storage.sync.get(['appStatus'])
        await setAppMode(appStatus === APP_STATUS.NONE || appStatus === APP_STATUS.CERTIFICATION ?
          APP_STATUS.SELECT_DEFENSE :
          appStatus
        )
        chrome.storage.local.set({ userStatus: USER_STATUS.REGISTERED })
        const { handle, tier: localTier } = await chrome.storage.local.get(['handle', 'tier'])
        const tier = localTier ?? (await fetchSolvedacUserInfo(handle)).tier
        const { rating } = await fetchUser(handle)
        setSolvedacInfo(tier, handle)
        setBOJRandomDefenseInfo(rating)
        setDefenseJoinButton(false)
        loginBlockElement.style.display = 'none'
        userBlockElement.style.display = 'flex'
        defenseInfoElement.style.display = 'flex'
        voidUserBlockElement.style.display = 'none'
      } catch (error) {
        console.error(error)
      }
      break
    }
  }
}

const setAppMode = async (mode, props) => {
  const certificationBlockElement = document.getElementById('certification-block')
  const contentsBlockElement = document.getElementById('contents-block')
  const rangeDefenseBlockElement = document.getElementById('range-defense-block')
  const rankDefenseBlockElement = document.getElementById('rank-defense-block')
  const problemSolveBlockElement = document.getElementById('problem-solve-block')
  const resultBlockElement = document.getElementById('result-block')
  const noneBlockElement = document.getElementById('none-block')
  const voidBlockElement = document.getElementById('void-block')

  certificationBlockElement.style.display = 'none'
  contentsBlockElement.style.display = 'none'
  rangeDefenseBlockElement.style.display = 'none'
  rankDefenseBlockElement.style.display = 'none'
  problemSolveBlockElement.style.display = 'none'
  resultBlockElement.style.display = 'none'
  noneBlockElement.style.display = 'none'
  voidBlockElement.style.display = 'none'
  switch (mode) {
    case APP_STATUS.CERTIFICATION: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.CERTIFICATION })
      try {
        const { code, codeCreatedAt, handle } = props ?? await chrome.storage.local.get(['code', 'codeCreatedAt', 'handle'])
        await chrome.storage.local.set({ code, codeCreatedAt })
        setCertificationBlock(code, codeCreatedAt, handle)
      } catch (error) {
        console.error(error)
      }
      break
    }
    case APP_STATUS.SELECT_DEFENSE: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.SELECT_DEFENSE })
      setContentsBlock()
      setHeaderButtons('logout')
      break
    }
    case APP_STATUS.RANGE_DEFENSE: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.RANGE_DEFENSE })
      setDefenseJoinButton(false)
      setRangeDefenseBlock()
      setHeaderButtons('goMain')
      break
    }
    case APP_STATUS.RANK_DEFENSE: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.RANK_DEFENSE })
      setDefenseJoinButton(false)
      setRankDefenseBlock()
      setHeaderButtons('goMain')
      break
    }
    case APP_STATUS.PROBLEM_SOLVE: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.PROBLEM_SOLVE })
      setDefenseJoinButton(false)
      setHeaderButtons('noButton')
      try {
        const { handle } = await chrome.storage.local.get(['handle'])
        const { createdAt: problemCreatedAt, level, problemId, title, defense } = props ?? await fetchCurrentProblem(handle)
        setProblemSolveBlock(problemCreatedAt, level, problemId, title, defense)
      } catch (error) {
        console.error(error)
      }
      break
    }
    case APP_STATUS.RESULT: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.RESULT })
      setDefenseJoinButton(false)
      setHeaderButtons('goMain')
      try {
        const { handle, rating: previousRating } =  await chrome.storage.local.get(['handle', 'rating'])
        const { rating: currentRating } = await fetchUser(handle)
        setResultBlock(previousRating, currentRating)
      } catch (error) {
        console.error(error)
      }
      break
    }
    case APP_STATUS.NONE: {
      chrome.storage.sync.set({ appStatus: APP_STATUS.NONE })
      setDefenseJoinButton(false)
      setNone()
      break
    }
  }
}

const createDefenseJoinButtonListener = () => {
  const joinButtonElement = document.getElementById('join-button')
  const joinRetryButtonElement = document.getElementById('join-retry-button')

  joinButtonElement.style.display = 'none'
  joinRetryButtonElement.style.display = 'none'
  joinButtonElement.addEventListener('click', joinButtonEvent)
  joinRetryButtonElement.addEventListener('click', joinButtonEvent)
}

const createGoMainListener = () => {
  const goMainElement = document.getElementById('go-main')
  
  goMainElement.style.display = 'none'
  goMainElement.addEventListener('click', async () => {
    await setAppMode(APP_STATUS.SELECT_DEFENSE)
  })
}

const createLogoutListener = () => {
  const logoutElement = document.getElementById('logout')

  logoutElement.style.display = 'none'
  logoutElement.addEventListener('click', logoutButtonEvent)
}

const createRefreshListener = () => {
  const refreshElement = document.getElementById('refresh')

  refreshElement.addEventListener('click', refreshButtonEvent)
}

const createCertificationListener = () => {
  const certificationCodeElement = document.getElementById('certification-code')
  const certificationCopyButtonElement = document.getElementById('copy-button')
  const certificationConfirmButtonElement = document.getElementById('certification-confirm-button')

  certificationCodeElement.addEventListener('click', certificationCodeCopyEvent)
  certificationCopyButtonElement.addEventListener('click', certificationCodeCopyEvent)
  certificationConfirmButtonElement.addEventListener('click', certificationConfirmButtonEvent)
}

const createContentsListener = () => {
  const rangeDefenseButtonElement = document.getElementById('range-defense-button')
  const rankDefenseButtonElement = document.getElementById('rank-defense-button')

  rangeDefenseButtonElement.addEventListener('click', async () => {
    await setAppMode(APP_STATUS.RANGE_DEFENSE)
  })
  rankDefenseButtonElement.addEventListener('click', async () => {
    await setAppMode(APP_STATUS.RANK_DEFENSE)
  })
}

const createRangeDefenseBlockListener = () => {
  const rangeDefenseLowInputElement = document.getElementById('range-defense-low-input')
  const rangeDefenseHighInputElement = document.getElementById('range-defense-high-input')
  const rangeDefenseLowDropdownArrow = document.getElementById('range-defense-low-dropdown-arrow')
  const rangeDefenseHighDropdownArrow = document.getElementById('range-defense-high-dropdown-arrow')
  const rangeDefenseLowDropdownContent = document.getElementById('range-defense-low-dropdown-content')
  const rangeDefenseHighDropdownContent = document.getElementById('range-defense-high-dropdown-content')
  const rangeDefenseLowValueElement = document.getElementById('range-defense-low-value')
  const rangeDefenseHighValueElement = document.getElementById('range-defense-high-value')
  const rangeDefenseStartButtonElement = document.getElementById('range-defense-start-button')

  rangeDefenseLowInputElement.addEventListener('mouseenter', () => {
    rangeDefenseLowDropdownArrow.style.transform = 'rotate(180deg)'
    rangeDefenseLowDropdownArrow.style.transition = 'transform 0.2s'
  })
  rangeDefenseLowInputElement.addEventListener('mouseleave', () => {
    rangeDefenseLowDropdownArrow.style.transform = 'rotate(0deg)'
    rangeDefenseLowDropdownArrow.style.transition = 'transform 0.2s'
  })

  rangeDefenseHighInputElement.addEventListener('mouseenter', () => {
    rangeDefenseHighDropdownArrow.style.transform = 'rotate(180deg)'
    rangeDefenseHighDropdownArrow.style.transition = 'transform 0.2s'
  })
  rangeDefenseHighInputElement.addEventListener('mouseleave', () => {
    rangeDefenseHighDropdownArrow.style.transform = 'rotate(0deg)'
    rangeDefenseHighDropdownArrow.style.transition = 'transform 0.2s'
  })

  for (let i = 1; i <= 30; i++) {
    const rangeDefenseDropdownItem = document.getElementById(`range-defense-low-dropdown-item${i}`)
    rangeDefenseDropdownItem.addEventListener('click', async (event) => {
      const { highLevel } = await chrome.storage.local.get(['highLevel'])
      if(i > highLevel) {
        rangeDefenseHighValueElement.textContent = getLevelText(i)
        rangeDefenseHighValueElement.style.color = getLevelColor(i)
        rangeDefenseHighDropdownContent.style.visibility = 'hidden'
        chrome.storage.local.set({ highLevel: i })
      }
      rangeDefenseLowValueElement.textContent = getLevelText(i)
      rangeDefenseLowValueElement.style.color = getLevelColor(i)
      rangeDefenseLowDropdownContent.style.visibility = 'hidden'
      chrome.storage.local.set({ lowLevel: i })
      event.stopPropagation()
    })
  }
  rangeDefenseLowInputElement.addEventListener('click', () => {
    rangeDefenseLowDropdownContent.style.visibility = 'visible'
  })
  document.addEventListener('mouseup', (event) => {
    if (!rangeDefenseLowDropdownContent.contains(event.target)) {
      rangeDefenseLowDropdownContent.style.visibility = 'hidden'
    }
  })

  for (let i = 1; i <= 30; i++) {
    const rangeDefenseDropdownItem = document.getElementById(`range-defense-high-dropdown-item${i}`)
    rangeDefenseDropdownItem.addEventListener('click', async (event) => {
      const { lowLevel } = await chrome.storage.local.get(['lowLevel'])
      if(i < lowLevel) {
        rangeDefenseLowValueElement.textContent = getLevelText(i)
        rangeDefenseLowValueElement.style.color = getLevelColor(i)
        rangeDefenseLowDropdownContent.style.visibility = 'hidden'
        chrome.storage.local.set({ lowLevel: i })
      }
      rangeDefenseHighValueElement.textContent = getLevelText(i)
      rangeDefenseHighValueElement.style.color = getLevelColor(i)
      rangeDefenseHighDropdownContent.style.visibility = 'hidden'
      chrome.storage.local.set({ highLevel: i })
      event.stopPropagation()
    })
  }
  rangeDefenseHighInputElement.addEventListener('click', () => {
    rangeDefenseHighDropdownContent.style.visibility = 'visible'
  })
  document.addEventListener('mouseup', (event) => {
    if (!rangeDefenseHighDropdownContent.contains(event.target)) {
      rangeDefenseHighDropdownContent.style.visibility = 'hidden'
    }
  })

  rangeDefenseStartButtonElement.addEventListener('click', rangeDefenseStartButtonEvent)
}

const createRankDefenseBlockListener = () => {
  const rankDefenseStartButtonElement = document.getElementById('rank-defense-start-button')
  
  rankDefenseStartButtonElement.addEventListener('click', rankDefenseStartButtonEvent)
}

const createProblemSolveBlockListener = () => {
  const problemSolveButtonElement = document.getElementById('problem-solve-button')
  const problemPassButtonElement = document.getElementById('problem-pass-button')
  
  problemSolveButtonElement.addEventListener('click', problemSolveButtonEvent)
  problemPassButtonElement.addEventListener('click', problemPassButtonEvent)
}

const setCertificationBlock = (code, codeCreatedAt) => {
  const certificationBlockElement = document.getElementById('certification-block')
  const certificationCodeElement = document.getElementById('certification-code')
  const certificationTimeLimitElement = document.getElementById('certification-time-limit')
  const certificationTimeOutElement = document.getElementById('certification-time-out')
  
  certificationBlockElement.style.display = 'flex'
  certificationTimeOutElement.style.display = 'none'
  certificationCodeElement.innerText = `${code}`
  const certificationInterval = setInterval(() => {
    const diff = Math.floor((new Date(codeCreatedAt) - new Date() + 5 * 60 * 1000) / 1000)
    certificationTimeOutElement.style.display = 'none'
    certificationTimeLimitElement.textContent = `${Math.floor(diff/60)}:${String(diff%60).padStart(2, '0')}`
    certificationTimeLimitElement.style.display = 'block'
    if (diff < 0) {
      certificationTimeOutElement.style.display = 'block'
      certificationTimeLimitElement.style.display = 'none'
      const certificationIntervalId = certificationIntervalStack.shift()
      clearInterval(certificationIntervalId)
    }
  }, 1000)
  certificationIntervalStack = [...certificationIntervalStack, certificationInterval]
}

const setContentsBlock = () => {
  const contentsBlockElement = document.getElementById('contents-block')
  
  contentsBlockElement.style.display = 'flex'
}

const setRangeDefenseBlock = async () => {
  const rangeDefenseBlockElement = document.getElementById('range-defense-block')
  const rangeDefenseLowValueElement = document.getElementById('range-defense-low-value')
  const rangeDefenseHighValueElement = document.getElementById('range-defense-high-value')

  try {
    const { lowLevel, highLevel } = await chrome.storage.local.get(['lowLevel', 'highLevel'])
    rangeDefenseLowValueElement.textContent = `${getLevelText(lowLevel)}`
    rangeDefenseLowValueElement.style.color = getLevelColor(lowLevel)
    rangeDefenseHighValueElement.textContent = `${getLevelText(highLevel)}`
    rangeDefenseHighValueElement.style.color = getLevelColor(highLevel)

    rangeDefenseBlockElement.style.display = 'flex'
    for (let i = 1; i <= 30; i++) {
      const rangeDefenseDropdownItem = document.getElementById(`range-defense-low-dropdown-item${i}`)
      rangeDefenseDropdownItem.textContent = getLevelText(i)
      rangeDefenseDropdownItem.style.color = getLevelColor(i)
    }

    for (let i = 1; i <= 30; i++) {
      const rangeDefenseDropdownItem = document.getElementById(`range-defense-high-dropdown-item${i}`)
      rangeDefenseDropdownItem.textContent = getLevelText(i)
      rangeDefenseDropdownItem.style.color = getLevelColor(i)
    }
  } catch (error) {
    console.error(error)
  }
}

const setRankDefenseBlock = async () => {
  const rankDefenseBlockElement = document.getElementById('rank-defense-block')
  const rankDefenseLowLevelElement = document.getElementById('rank-defense-low-level')
  const rankDefenseHighLevelElement = document.getElementById('rank-defense-high-level')

  rankDefenseBlockElement.style.display = 'flex'
  try {
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      return
    }
    
    const { lowLevel, highLevel } = await fetchRankDefenseLevel(cookie.value)
    rankDefenseLowLevelElement.textContent = `${getLevelText(lowLevel)}`
    rankDefenseLowLevelElement.style.color = getLevelColor(lowLevel)
    rankDefenseHighLevelElement.textContent = `${getLevelText(highLevel)}`
    rankDefenseHighLevelElement.style.color = getLevelColor(highLevel)
  } catch (error) {
    console.error(error)
  }
}

const setProblemSolveBlock = async (problemCreatedAt, level, problemId, title, defense) => {
  const problemSolveBlockElement = document.getElementById('problem-solve-block')
  const problemSolveDefenseTypeElement = document.getElementById('problem-solve-defense-type')
  const problemTierImageElement = document.getElementById('problem-tier-img')
  const problemIdElement = document.getElementById('problem-id')
  const problemTitleElement = document.getElementById('problem-title')
  const problemSolveButtonElement = document.getElementById('problem-solve-button')
  const problemSolveButtonWarningElement = document.getElementById('problem-solve-button-warning')
  const problemPassButtonElement = document.getElementById('problem-pass-button')
  const problemPassButtonNotifyElement = document.getElementById('problem-pass-button-notify')

  problemSolveDefenseTypeElement.textContent = defense === DEFENSE_TYPE.RANGE ? 'Range Defense' : 'Rank Defense'
  problemTierImageElement.src = `${STATIC_SOLVEDAC_URL}/tier_small/${level}.svg`
  problemIdElement.href = `${ACMICPC_URL}/problem/${problemId}`
  problemIdElement.style.color = getLevelColor(level)
  problemIdElement.textContent = `${problemId}`
  problemTitleElement.href = `${ACMICPC_URL}/problem/${problemId}`
  problemTitleElement.textContent = `${title}`
  problemSolveBlockElement.style.display = 'flex'

  try {
    const { handle } = await chrome.storage.local.get(['handle'])
    const isSolved = await fetchIsProblemSolved(handle, problemId)
    if (isSolved) {
      const diff = Math.floor((new Date(problemCreatedAt) - new Date() + 1 * 60 * 60 * 1000 + 5 * 60 * 1000) / 1000)
      if (diff > 0) {
        problemPassButtonElement.disabled = true
        problemPassButtonNotifyElement.style.display = 'block'
        problemPassButtonNotifyElement.textContent = messages.solved
      }
    }
  } catch (error) {
    console.error(error)
  }

  const problemTimeLimitElement = document.getElementById('problem-time-limit')
  const problemTimeOutElement = document.getElementById('problem-time-out')
  
  while (problemIntervalStack.length > 0) {
    const problemIntervalId = problemIntervalStack.shift()
    clearInterval(problemIntervalId)
  }

  const problemInterval = setInterval(() => {
    const diff = Math.floor((new Date(problemCreatedAt) - new Date() + 1 * 60 * 60 * 1000 + 5 * 60 * 1000) / 1000)
    problemTimeOutElement.style.display = 'none'
    problemTimeLimitElement.textContent = `${Math.floor(diff/60)}:${String(diff%60).padStart(2, '0')}`
    problemTimeLimitElement.style.display = 'block'
    if (diff < 0) {
      problemTimeOutElement.style.display = 'block'
      problemTimeLimitElement.style.display = 'none'
      problemSolveButtonWarningElement.style.display = 'block'
      problemSolveButtonWarningElement.textContent = messages.sorryTooLate
      problemSolveButtonElement.disabled = true
      problemPassButtonElement.disabled = false
      problemPassButtonNotifyElement.style.display = 'none'
      const problemIntervalId = problemIntervalStack.shift()
      clearInterval(problemIntervalId)
    }
  }, 1000)
  problemIntervalStack = [...problemIntervalStack, problemInterval]
}

const setResultBlock = async (previousRating, currentRating) => {
  const resultBlockElement = document.getElementById('result-block')
  const resultRatingElement = document.getElementById('result-rating')

  resultRatingElement.innerText = String(previousRating)
  setRatingStyle(resultRatingElement, previousRating)
  resultBlockElement.style.display = 'flex'

  const duration = 2500
  const frameRate = 1000 / 60
  const totalFrame = Math.round(duration / frameRate)
  const diffRating = currentRating - previousRating
  setTimeout(() => {
    let value = 0
    let count = 0
    const counter = setInterval(() => {
      const progressRate = easeOutExpo(++count / totalFrame)
      value = Math.round(diffRating * progressRate)
      resultRatingElement.innerText = String(previousRating + value)
      
      if (progressRate === 1) {
        setRatingStyle(resultRatingElement, currentRating)
        clearInterval(counter)
        setBOJRandomDefenseInfo(currentRating)
      }
    }, frameRate)
  }, 500)

  await chrome.storage.local.set({ rating: currentRating })
}

const setNone = () => {
  const noneBlockElement = document.getElementById('none-block')
  
  noneBlockElement.style.display = 'flex'
}

const setSolvedacServerStatusBlock = async () => {
  const solvedacServerStatusBlockElement = document.getElementById('solvedac-server-status-block')
  const solvedacServerStatusElement = document.getElementById('solvedac-server-status')
  
  solvedacServerStatusBlockElement.style.display = 'flex'
  solvedacServerStatusElement.textContent = messages.checking
  solvedacServerStatusElement.style.color = "black"
  solvedacServerStatusElement.style.fontWeight = "bold"

  try {
    const { handle } = await chrome.storage.local.get(['handle'])
    const startTime = new Date()
    await fetchSolvedacServerStatus(handle)
    const endTime = new Date()
    const diffTime = endTime.getTime() - startTime.getTime()

    solvedacServerStatusElement.textContent = diffTime > 2000 ? messages.serverSlow(diffTime) : messages.serverOK(diffTime)
    solvedacServerStatusElement.style.color = diffTime > 2000 ? "orange" : "green"
    solvedacServerStatusElement.style.fontWeight = "bold"
  } catch (error) {
    solvedacServerStatusElement.textContent = messages.error
    solvedacServerStatusElement.style.color = "red"
    solvedacServerStatusElement.style.fontWeight = "bold"
    console.error(error)
  }
}

onload = async () => {
  createDefenseJoinButtonListener()
  createGoMainListener()
  createLogoutListener()
  createRefreshListener()
  createCertificationListener()
  createContentsListener()
  createRangeDefenseBlockListener()
  createRankDefenseBlockListener()
  createProblemSolveBlockListener()
  
  const { userStatus } = await chrome.storage.local.get(['userStatus'])
  switch (userStatus) {
    case USER_STATUS.UNAUTHORIZED: {
      try {
        const cookies = await chrome.cookies.getAll({ domain: `.${SOLVEDAC_COOKIE_URL}` })
        const cookie = cookies[0]
        if (!cookie) {
          throw new Error(error)
        }
  
        const { user } = await fetchVerifyCredentials(cookie.value)
        const { handle, tier } = user
        await chrome.storage.local.set({ handle, tier })
        setUserMode(USER_STATUS.UNREGISTERED)
      } catch (error) {
        console.error(error)
        setUserMode(USER_STATUS.UNAUTHORIZED)
      }
      break
    }
    case USER_STATUS.UNREGISTERED: {
      try {
        const cookies = await chrome.cookies.getAll({ domain: `.${SOLVEDAC_COOKIE_URL}` })
        if (cookies.length === 0) {
          throw new Error(error)
        }
        setUserMode(USER_STATUS.UNREGISTERED)
      } catch (error) {
        setUserMode(USER_STATUS.UNAUTHORIZED)
      }
      break
    }
    case USER_STATUS.REGISTERED: {
      try {
        const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
        const cookie = cookies[0]
        if (!cookie) {
          throw new Error(error)
        }
        if (cookie.expirationDate < new Date().getTime() / 1000) {
          throw new Error(error)
        }

        const { handle, rating } = await fetchUserWithToken(cookie.value)
        await chrome.storage.local.set({ handle, rating })
        setUserMode(USER_STATUS.REGISTERED)
      } catch (error) {
        console.error(error)
        setUserMode(USER_STATUS.UNREGISTERED)
      }
      break
    }
  }
  setSolvedacServerStatusBlock()
}

const joinButtonEvent = async () => {
  const joinButtonElement = document.getElementById('join-button')
  const joinRetryButtonElement = document.getElementById('join-retry-button')

  try {
    joinButtonElement.disabled = true
    joinRetryButtonElement.disabled = true

    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'refreshToken' })
    const cookie = cookies[0]
    if (cookie) {
      const data = await fetchAccessToken(cookie.value)
      if (data) {
        await setAppMode(APP_STATUS.SELECT_DEFENSE)
        setUserMode(USER_STATUS.REGISTERED)
        return
      }
    }

    const { handle } = await chrome.storage.local.get(['handle'])
    const { code, createdAt } = await fetchAuthenticationCode(handle)

    const certificationIntervalId = certificationIntervalStack.shift()
    clearInterval(certificationIntervalId)

    await setAppMode(APP_STATUS.CERTIFICATION, { code, codeCreatedAt: createdAt, handle })
    joinButtonElement.style.display = 'none'
    joinRetryButtonElement.style.display = 'flex'
  } catch (error) {
    console.error(error)
  } finally {
    joinButtonElement.disabled = false
    joinRetryButtonElement.disabled = false
  }
}

const logoutButtonEvent = async () => {
  try {
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'refreshToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      throw new Error(error)
    }

    const data = await fetchLogout(cookie.value)
    if (!data) {
      throw new Error(error)
    }

    await chrome.cookies.remove({
      url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
      name: 'accessToken',
    })
    await chrome.cookies.remove({
      url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
      name: 'refreshToken',
    })
    setUserMode(USER_STATUS.UNREGISTERED)
  } catch (error) {
    console.error(error)
  }
}

const certificationCodeCopyEvent = async () => {
  const certificationCopyButtonElement = document.getElementById('copy-button')
  const certificationCopiedButtonElement = document.getElementById('copied-button')

  try {
    const { code } = await chrome.storage.local.get(['code'])
    await navigator.clipboard.writeText(code)
    certificationCopyButtonElement.style.display = 'none'
    certificationCopiedButtonElement.style.display = 'block'
  } catch (error) {
    console.error(error)
  }
}

const certificationConfirmButtonEvent = async () => {
  const certificationConfirmButtonElement = document.getElementById('certification-confirm-button')
  const certificationStatusElement = document.getElementById('certification-status')

  try {
    certificationConfirmButtonElement.disabled = true
    const { code, handle } = await chrome.storage.local.get(['code', 'handle'])
    await fetchLogin(code, handle)
    await setAppMode(APP_STATUS.SELECT_DEFENSE)
    setUserMode(USER_STATUS.REGISTERED)
  } catch (error) {
    certificationStatusElement.innerText = messages.wrongCode
    console.error(error)
  } finally {
    certificationConfirmButtonElement.disabled = false
  }
}

const rangeDefenseStartButtonEvent = async () => {
  const rangeDefenseStartButtonElement = document.getElementById('range-defense-start-button')
  const rangeDefenseWarningElement = document.getElementById('range-defense-warning')

  try {
    rangeDefenseStartButtonElement.disabled = true
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      throw new Error(error)
    }

    const { lowLevel, highLevel } = await chrome.storage.local.get(['lowLevel', 'highLevel'])
    const { problem, createdAt, defense } = await fetchRangeDefense(cookie.value, lowLevel, highLevel)
    if (!problem) {
      rangeDefenseWarningElement.textContent = messages.rangeDefenseWarning(lowLevel, highLevel)
      rangeDefenseWarningElement.style.display = 'flex'
      throw new Error(error)
    }

    rangeDefenseWarningElement.style.display = 'none'
    const { level, problemId, titleKo } = problem;
    await chrome.alarms.create(TEN_MINUTE_ALARM, { when: Date.now() + 1000 * 60 * 55 });

    await setAppMode(APP_STATUS.PROBLEM_SOLVE, { level, problemId, title: titleKo, createdAt, defense })
  } catch (error) {
    console.error(error)
  } finally {
    rangeDefenseStartButtonElement.disabled = false
  }
}

const rankDefenseStartButtonEvent = async () => {
  const rankDefenseStartButtonElement = document.getElementById('rank-defense-start-button')
  try {
    rankDefenseStartButtonElement.disabled = true
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      throw new Error(error)
    }

    const { problem, createdAt, defense } = await fetchRankDefense(cookie.value)
    const { level, problemId, titleKo } = problem
    await chrome.alarms.create(TEN_MINUTE_ALARM, { when: Date.now() + 1000 * 60 * 55 });

    await setAppMode(APP_STATUS.PROBLEM_SOLVE, { level, problemId, title: titleKo, createdAt, defense })
  } catch (error) {
    console.error(error)
  } finally {
    rankDefenseStartButtonElement.disabled = false
  }
}

const refreshButtonEvent = async () => {
  try {
    const cookies = await chrome.cookies.getAll({ domain: `.${SOLVEDAC_COOKIE_URL}` })
    const cookie = cookies[0]
    if (!cookie) {
      throw new Error('No cookie')
    }

    const { user } = await fetchVerifyCredentials(cookie.value)
    const { handle, tier } = user
    await chrome.storage.local.set({ handle, tier })

    await chrome.cookies.remove({
      url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
      name: 'accessToken',
    })
    await chrome.cookies.remove({
      url: `https://${BOJ_RANDOM_DEFENSE_COOKIE_URL}/`,
      name: 'refreshToken',
    })
    setUserMode(USER_STATUS.UNREGISTERED)
  } catch (error) {
    console.error(error)
    setUserMode(USER_STATUS.UNAUTHORIZED)
  }
}

const problemSolveButtonEvent = async () => {
  const problemSolveButtonElement = document.getElementById('problem-solve-button')
  const problemSolveButtonWarningElement = document.getElementById('problem-solve-button-warning')
  try {
    problemSolveButtonElement.disabled = true
    const { handle } = await chrome.storage.local.get(['handle'])
    const { problemId } = await fetchCurrentProblem(handle)
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      throw new Error(error)
    }

    const { log, solved } = await fetchSolve(cookie.value, problemId)
    if (!solved) {
      problemSolveButtonWarningElement.style.display = 'block'
      problemSolveButtonWarningElement.textContent = messages.notYetSolved
      throw new Error(error)
    }
    const { rating } = log;
    if (!rating) {
      throw new Error(error)
    }

    await chrome.alarms.clear(TEN_MINUTE_ALARM)
    await setAppMode(APP_STATUS.RESULT, {
      handle,
      rating,
    })
  } catch (error) {
    console.error(error)
  } finally {
    problemSolveButtonElement.disabled = false
  }
}

const problemPassButtonEvent = async () => {
  const problemPassButtonElement = document.getElementById('problem-pass-button')
  try {
    problemPassButtonElement.disabled = true
    const { handle } = await chrome.storage.local.get(['handle'])
    const { problemId } = await fetchCurrentProblem(handle)
    const cookies = await chrome.cookies.getAll({ domain: `.${BOJ_RANDOM_DEFENSE_COOKIE_URL}`, name: 'accessToken' })
    const cookie = cookies[0]
    if (!cookie) {
      setUserMode(USER_STATUS.UNREGISTERED)
      throw new Error(error)
    }

    const { log } = await fetchPass(cookie.value, problemId)
    const { rating } = log;
    if (!rating) {
      throw new Error(error)
    }

    await chrome.alarms.clear(TEN_MINUTE_ALARM)
    await setAppMode(APP_STATUS.RESULT, {
      handle,
      rating,
    })
  } catch (error) {
    console.error(error)
  } finally {
    problemPassButtonElement.disabled = false
  }
}
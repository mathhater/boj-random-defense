import { messages } from '../util/messages.js'
import {
  BOJ_RD_API_URL,
  SOLVEDAC_API_URL
} from '../util/constants.js'

export const fetchRangeDefense = async (cookie, lowLevel, highLevel) => {
  const response = await fetch(`${BOJ_RD_API_URL}/range`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    },
    body: JSON.stringify({
      lowLevel,
      highLevel
    })
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchRankDefense = async (cookie) => {
  const response = await fetch(`${BOJ_RD_API_URL}/rank`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    }
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchRankDefenseLevel = async (cookie) => {
  const response = await fetch(`${BOJ_RD_API_URL}/rank`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${cookie}`
    }
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchCurrentProblem = async (handle) => {
  const response = await fetch(`${BOJ_RD_API_URL}/currentproblem?handle=${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchUser = async (handle) => {
  const response = await fetch(`${BOJ_RD_API_URL}/user?handle=${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchUserWithToken = async (cookie) => {
  const response = await fetch(`${BOJ_RD_API_URL}/user`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    },
  })

  if (response.status === 200) {
    return response.json()
  } else if (response.status === 401) {
    throw new Error(messages.noToken)
  } else if (response.status === 403) {
    throw new Error(messages.wrongToken)
  } else if (response.status === 404) {
    throw new Error(messages.notFound)
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchAccessToken = async (cookie) => {
  const response = await fetch(`${BOJ_RD_API_URL}/token`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    },
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchAuthenticationCode = async (handle) => {
  const response = await fetch(`${BOJ_RD_API_URL}/authenticate?handle=${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchLogin = async (code, handle) => {
  const response = await fetch(`${BOJ_RD_API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ code, handle }),
    mode: 'cors',
  })

  if (response.status === 200) {
    return response.json()
  } else if (response.status === 401) {
    throw new Error(messages.wrongCode)
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchLogout = async (cookie) => {
  const response = await fetch(`${BOJ_RD_API_URL}/logout`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${cookie}`
    },
  })

  if (response.status === 204) {
    return true
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchSolve = async (cookie, problemId) => {
  const response = await fetch(`${BOJ_RD_API_URL}/solve`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    },
    body: JSON.stringify({ problemId })
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchPass = async (cookie, problemId) => {
  const response = await fetch(`${BOJ_RD_API_URL}/pass`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${cookie}`
    },
    body: JSON.stringify({ problemId })
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.bojrdNetworkError)
  }
}

export const fetchVerifyCredentials = async (solvedacToken) => {
  const response = await fetch(`${SOLVEDAC_API_URL}/account/verify_credentials`, {
    method: 'GET',
    headers: {
      solvedacToken,
    },
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.solvedacNetworkError)
  }
}

export const fetchSolvedacUserInfo = async (handle) => {
  const response = await fetch(`${SOLVEDAC_API_URL}/user/show?handle=${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.solvedacNetworkError)
  }
}

export const fetchIsProblemSolved = async (handle, problemId) => {
  const response = await fetch(`${SOLVEDAC_API_URL}/search/problem?query=id%3A${problemId}+%40${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    const data = await response.json()
    return data.count === 1
  } else {
    throw new Error(messages.solvedacNetworkError)
  }
}

export const fetchSolvedacServerStatus = async (handle) => {
  const response = await fetch(`${SOLVEDAC_API_URL}/search/problem?query=id%3A${1000}+%40${handle}`, {
    method: 'GET',
  })

  if (response.status === 200) {
    return response.json()
  } else {
    throw new Error(messages.solvedacNetworkError)
  }
}
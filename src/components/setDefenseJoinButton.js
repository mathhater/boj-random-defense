export const setDefenseJoinButton = async (active) => {
  const joinButtonElement = document.getElementById('join-button')
  const joinRetryButtonElement = document.getElementById('join-retry-button')

  if (!active) {
    joinButtonElement.style.display = 'none'
    joinRetryButtonElement.style.display = 'none'
    return
  }
  
  const { codeCreatedAt } = await chrome.storage.local.get(['codeCreatedAt'])
  if (codeCreatedAt === '') {
    joinButtonElement.style.display = 'flex'
    joinRetryButtonElement.style.display = 'none'
  }
  else{
    joinButtonElement.style.display = 'none'
    joinRetryButtonElement.style.display = 'flex'
  }
}
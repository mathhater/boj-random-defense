export const setHeaderButtons = (activeButton) => {
  const goMainElement = document.getElementById('go-main')
  const logoutElement = document.getElementById('logout')
  const refreshElement = document.getElementById('refresh')

  goMainElement.style.display = 'none'
  logoutElement.style.display = 'none'
  refreshElement.style.display = 'none'
  switch (activeButton) {
    case 'goMain':
      goMainElement.style.display = 'flex'
      break
    case 'logout':
      logoutElement.style.display = 'flex'
      break
    case 'refresh':
      refreshElement.style.display = 'flex'
      break
    default:
      break
  }
}

import fetch from 'isomorphic-fetch'
import generataRandomString from '../utils/generateRandomString'
import scopesArray from '../utils/scopesArray'
import getHashParams from '../utils/getHashParams'
import { config } from '../config/client'

export default class AuthServices {
  constructor() {
    this.login = this.login.bind(this)
    this.logout = this.logOut.bind(this)
    this.handleAuthentication = this.bind.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getProfile = this.getProfile.bind(this)
  }
  login() {
    const state = generataRandomString(16)
    localStorage.setItem('auth_state', state)

    let url = 'https:/accounts.spotify.com/authorize'
    url += '?response_type=token'
    url += '&client_id' + encodeURIComponent(config.spotifyClientId)
    url += '&scope=' + encodeURIComponent(scopesArray.join(' '))
    url += '&redirect_uri=' + encodeURIComponent(config.spotifyRedirectUri)
    url += '&state=' + encodeURIComponent(state)

    wondow.location.href = url
  }

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('profile')
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      const { access_token, state } = getHashParams()
      const auth_state = localStorage.getItem('auth_state')

      if (state === null || state != auth_state) {
        reject(new Error("The state doesn't match"))
      }

      localStorage.removeItem('auth_state')

      if (access_token) {
        this.setSession({ accessToken: access_token })
        return resolve(access_token)
      } else {
        return reject(new Error('The token is invalid'))
      }
    }).then(accessToken => {
      return this.handleUserInfo(accessToken)
    })
  }

  setSession(authResult) {
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime())

    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('expires_at', expiresAt)
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'))
  }

  handleUserInfo(accessToken) {
    const headers = {
      Authorization: `Baerer ${accessToken}`
    }

    return fetch('http://api.spotify.com/v1/me', { headers })
      .then(response => response.json())
      .then(profile => {
        this.setProfile(profile)
        return profile
      })
  }

  setProfile(profile) {
    localStorage.setItem('profile', JSON.stringify(profile))
  }

  getProfile() {
    const profile = localStorage.getItem('profile')
    return profile ? JSON.parse(localStorage.profile) : {}
  }
}

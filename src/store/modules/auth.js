import AuthenticationService from '@/services/AuthenticationService'

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isUserLoggedIn: !!localStorage.getItem('token')
}

const getters = {
  isAuthenticated: state => state.isUserLoggedIn,
  currentUser: state => state.user,
  getToken: state => state.token
}

const mutations = {
  SET_TOKEN(state, token) {
    state.token = token
    state.isUserLoggedIn = !!token
    localStorage.setItem('token', token)
  },
  SET_USER_DATA(state, user) {
    state.user = user
    localStorage.setItem('user', JSON.stringify(user))
  },
  CLEAR_AUTH(state) {
    state.token = null
    state.user = null
    state.isUserLoggedIn = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}

const actions = {
  async signUp({ dispatch }, credentials) {
    const response = await AuthenticationService.signUp(credentials)
    dispatch('setToken', response.data.token)
    return dispatch('getCurrentUser')
  },
  async signIn({ dispatch }, credentials) {
    const response = await AuthenticationService.signIn(credentials)
    dispatch('setToken', response.data.token)
    return dispatch('getCurrentUser')
  },
  async getCurrentUser({ commit, state }) {
    if (!state.token) return null
    try {
      const response = await AuthenticationService.me(state.token)
      commit('SET_USER_DATA', response.data.data)
      return response.data.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      commit('CLEAR_AUTH')
      return null
    }
  },
  setToken({ commit }, token) {
    commit('SET_TOKEN', token)
  },
  signOut({ commit }) {
    commit('CLEAR_AUTH')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

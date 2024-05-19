import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth'
import comments from './modules/comment'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    url: process.env.VUE_APP_URL
  },
  getters: {
    getUrl: state => state.url
  },
  mutations: {},
  actions: {
    setToken({ commit }, token) {
      commit('auth/SET_TOKEN', token)
    },
    setUser({ commit }, user) {
      commit('auth/SET_USER_DATA', user)
    },
    signOut({ commit }) {
      commit('auth/CLEAR_AUTH')
    }
  },
  modules: {
    auth,
    comments
  }
})

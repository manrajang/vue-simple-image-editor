import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    penMode: null,
  },
  actions: {
  },
  mutations: {
    setPenMode (state, penMode) {
      state.penMode = penMode
    },
  },
})

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    drawMode: null,
    shapeType: null
  },
  actions: {

  },
  mutations: {
    setDrawMode (state, drawMode) {
      state.drawMode = drawMode
    },
    setShapeType (state, shapeType) {
      state.shapeType = shapeType
    }
  }
})

<template>
  <div @click="onClickMenu">{{ text }}</div>
</template>

<script>
import { mapMutations } from 'vuex'
import { DRAW_MODE_TYPE, SHAPE_TYPE } from '@/constants'

export default {
  props: {
    text: { type: String },
    drawMode: { type: Number, default: DRAW_MODE_TYPE.DRAW },
    shapeType: { type: String, default: null }
  },
  methods: {
    ...mapMutations({
      SET_DRAW_MODE: 'setDrawMode',
      SET_SHAPE_TYPE: 'setShapeType'
    }),
    onClickMenu () {
      this.SET_DRAW_MODE(this.drawMode)
      this.SET_SHAPE_TYPE(this.shapeType)
    }
  }
}
</script>

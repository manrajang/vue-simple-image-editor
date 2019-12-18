<template>
  <div class="container">
    <item :drawMode="DRAW_MODE_TYPE.MOVE" text="이동"/>
    <item :shapeType="SHAPE_TYPE.RECT" text="사각형"/>
    <item :shapeType="SHAPE_TYPE.FREE" text="자유"/>
  </div>
</template>

<script>
import Item from '@/components/Menu/Item'
import { DRAW_MODE_TYPE, SHAPE_TYPE } from '@/constants'

export default {
  components: { Item },
  computed: {
    DRAW_MODE_TYPE () { return DRAW_MODE_TYPE },
    SHAPE_TYPE () { return SHAPE_TYPE }
  }
}
</script>

<style lang="scss" scoped>
  .container {
    display: inline-block;
  }
</style>

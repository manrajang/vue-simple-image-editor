<template>
  <div @click="onClickMenu">사각형</div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  methods: {
    ...mapMutations({ SET_PEN_MODE: 'setPenMode' }),
    onClickMenu () {
      this.SET_PEN_MODE('rect')
    }
  }
}
</script>

<style>

</style>

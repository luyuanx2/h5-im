<!--
* @Date: 2017/8/17  09:56
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template>
    <img :src="data" :data-url="data"  @click="previewImage">
</template>

<script>
    export default {
      props: {
        data: {
          type: String,
          default: ''
        }
      },
      methods: {
          previewImage() {
              this.$emit('previewImage', this.data)
          }
      }
    }
</script>

<style>
</style>

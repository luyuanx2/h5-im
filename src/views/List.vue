<template>
  <div>
    <ul v-if="friends.length">
      <li v-for="(item, index) in friends" class="item" @click="toChat(item)">{{item.name}}
      </li>
    </ul>
  </div>
</template>

<script>
  import WebIM from 'WebIM'
  export default {
    data() {
      return {
        friends: []
      }
    },
    methods: {
      toChat(item) {
        this.$router.push({
          path: '/chat',
          query: {'hxUser': item.name, 'code': this.$$vm.code}
        })
      }
    },
    created() {
      this.friends = this.$$vm.friends
    }
  }
</script>

<style>

</style>

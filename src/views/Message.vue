<template>
  <div>
    <ul v-if="applys.length">
      <li v-for="(item, index) in applys" ref="applyRef(index)" class="item" :key="index">{{item.status}}
        <button type="button" @click="apply(item.from,index)">同意</button>
        <button type="button" @click="refuse(item.from,index)">拒绝</button>
      </li>
    </ul>
    <ul v-if="noreadFriends.length">
      <li v-for="(item, index) in noreadFriends" class="item" @click="toChat(item)" :key="index">{{item.name}}
        <span class="noread" v-if="!!item.noread">{{item.noread}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import WebIM from 'WebIM'
export default {
  data() {
    return {
      applys: [],
      noreadFriends: []
    }
  },
  computed: {
    applyRef(index) {
      return 'apply' + index
    }
  },
  methods: {
    apply(to, index) {
      this.$agreeApply(to)
      this.removeApply(to)
    },
    refuse(to, index) {
      this.$refuseApply(to)
      this.removeApply(to)
    },
    removeApply(to) {
      const index = this.$$vm.applys.findIndex(item => {
        return item.from === to
      })
      this.$$vm.applys.splice(index, 1)
    },
    toChat(item) {
      this.$router.push({
        path: '/chat',
        query: { hxUser: item.name, code: this.$$vm.code }
      })
    },
    init() {
      this.$$vm.$watch(
        'friends',
        (val, oldVal) => {
          console.log('[Message]chatMsg change====================>', val)
          val.forEach(s => {
            if (s.noread > 0) {
              this.noreadFriends = []
              this.noreadFriends.push(s)
            }
          })
        },
        { deep: true }
      )
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init()
    })
  },
  created() {
    this.applys = this.$$vm.applys
  }
}
</script>

<style>
.noread {
  display: block;
  width: 20px;
  height: 20px;
  background-color: #f00;
  border-radius: 50%;
  color: #fff;
  text-align: center;
  line-height: 20px;
  font-size: 12px;
}
</style>

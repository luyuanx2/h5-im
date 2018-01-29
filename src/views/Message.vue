<template>
  <div>
    <ul v-if="applys.length">
      <li v-for="(item, index) in applys" class="item">{{item.status}}
        <button type="button" @click="apply(item.from)">同意</button>
        <button type="button" @click="refuse(item.from)">拒绝</button>
      </li>
    </ul>
    <ul v-if="noreadFriends.length">
      <li v-for="(item, index) in noreadFriends" class="item" @click="toChat(item)">{{item.name}}
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
    methods: {
      apply(to) {
        this.$agreeApply(to)
      },
      refuse(to) {
        this.$refuseApply(to)
      },
      toChat(item) {
        this.$router.push({
          path: '/chat',
          query: {'hxUser': item.name, 'code': this.$$vm.code}
        })
      },
      init() {
//        watch: {
//          items: {
//            handler: function () {},
//            deep: true
//          }
//        }
        this.$$vm.$watch('friends', (val, oldVal) => {
//          for (let i = 0; i < val.length; i++) {
//            if (oldVal[i].noread != val[i].noread) {
//              this.noreadFriends.push( val[i])
//            }
//          }
          console.log('[Message]chatMsg change====================>', val)
          val.forEach((s) => {
              if(s.noread > 0) {
                this.noreadFriends = []
                this.noreadFriends.push(s)
              }
            })
        },{deep:true})
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.init()
      })
    },
    created() {
      this.applys = this.$$vm.applys
//      this.noreadFriends = this.$$vm.friends
//      this.$$vm.friends.forEach((s) => {
//        if(s.noread > 0) {
//          this.noreadFriends.push(s)
//        }
//      })
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
    color: #FFF;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
  }
</style>

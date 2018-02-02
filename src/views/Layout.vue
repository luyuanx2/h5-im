<template>
<div class="weui-tab">
  <div class="weui-tab__panel">
    <router-view></router-view>
  </div>
  <div class="weui-tabbar">
      <a href="javascript:;" class="weui-tabbar__item weui-bar__item_on">
        <i class="iconfont icon-message"></i>
        <p class="weui-tabbar__label">消息</p>
      </a>
      <a href="javascript:;" class="weui-tabbar__item">
        <i class="iconfont icon-contact"></i>
        <p class="weui-tabbar__label">通讯录</p>
      </a>
  </div>
</div>
</template>
<script>
export default {
  name: 'Layout'
}
</script>
<style>
.weui-tabbar__item > i {
  font-size: 24px;
  line-height: 1;
}
.weui-bar__item_on .weui-tabbar__label {
  color: #ff9c00 !important;
}
.weui-bar__item_on > i {
  color: #ff9c00;
}
</style>

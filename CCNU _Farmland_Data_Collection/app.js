//app.js
App({
  onLaunch: function () {
    wx.cloud.init({
      env: 'wuqifan-wxcloud-1'
    }); //环境ID,//云数据库配置
  },
  globalData: {
    userInfo: null
  }
})
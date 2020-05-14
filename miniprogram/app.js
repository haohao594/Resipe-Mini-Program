//app.js
let height = 0;
App({
  onLaunch: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              //console.log("app.js:" + res)
              this.globalData.userInfo = res.userInfo
              this.globalData.login = false
              console.log('this.globalData.userInfo',this.globalData.userInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    //获取设备信息
    wx.getSystemInfo({
      success(res) {
        //console.log(res.windowHeight);
        height = res.windowHeight;
      }
    })
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: "test-sbdrw",//我的测试环境Id
        traceUser: true,
      })
    }

    this.globalData = {
      userInfo: null,
      phoneHeight: height,
      _openid:null
      }
  }
})

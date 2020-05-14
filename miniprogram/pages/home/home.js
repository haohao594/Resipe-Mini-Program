// pages/home/home.js
const app = getApp()
let userInfo = app.globalData.userInfo;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    avatarUrl: '',
    _openid: '',
    logged: false,
    nickName: '',
    place: '',
    collectList: [],
    menu: [ //views,likes,favorites,comments,about,feedback,contact,clear,split,link,page
      {
        tp: 'works',
        icon: '../../images/homeIcon/icon_work4.png',
        title: '我的创作',
        line: 1,
      },
      {
        tp: 'views',
        icon: '../../images/homeIcon/icon_view.png',
        title: '我的浏览',
        line: 1,
      },
      {
        tp: 'likes',
        icon: '../../images/homeIcon/icon_like.png',
        title: '我的关注',
        line: 1,
      },
      {
        tp: 'favorites',
        icon: '../../images/homeIcon/icon_fav.png',
        title: '我的收藏',
        line: 1,
      },
      {
        tp: 'comments',
        icon: '../../images/homeIcon/icon_com.png',
        title: '我的评论',
        line: 0,
      },
      {
        tp: 'customer',
        icon: '../../images/homeIcon/customer.png',
        title: '联系我们',
        line: 0,
      },
      {
        tp: 'feedback',
        icon: '',
        title: '意见反馈',
        line: 1,
      },
      {
        tp: 'contact',
        icon: '',
        title: '在线客服',
        line: 1,
      },
      {
        tp: 'clear',
        icon: '',
        title: '清除缓存',
        line: 0,
      },
    ]
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //调用Login云函数获取_openid存于全局变量 app.globalData._openid和该js中的_openid中
    if (!app.globalData._openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData._openid = res.result.openid
          that.setData({
            _openid: res.result.openid
          })
          console.log('[云函数] [login] 获取 _openid 成功，已存于app.globalData._openid，其值为：', app.globalData._openid)
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 _openid 失败，请检查是否有部署 login 云函数',
          })
          //console.log('[云函数] [login] 获取 _openid 失败，请检查是否有部署云函数，错误信息：', err)
        }
      })
    }

    // //获得设备信息
    // wx.getSystemInfo({
    //   success(res) {
    //     that.setData({
    //       phoneHeight: res.windowHeight,
    //     })
    //   }
    // })

    // 查看是否授权
    
    if (app.globalData.userInfo === null) {
      that.setData({
        logged: false //未授权
      })
      console.log('[app.globalData.userInfo]其值为null,该用户目前尚未授权')
    } else {
      that.setData({
        logged: true, //已授权
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName
      })
      console.log('该用户已授权')
    }
  },

  // 获取用户的头像和昵称
  bindGetUserInfo(e) {
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        app.globalData.userInfo = e.detail.userInfo;
        that.setData({
          logged: true,
          avatarUrl: e.detail.userInfo.avatarUrl,
          nickName: e.detail.userInfo.nickName
        })
      }
    })
    setTimeout(function () {
      that.onUser()
    }, 0)
    wx.hideLoading()
  },

  // 记录头像昵称,头像上传到云存储返回地址保存到user表
  onUser() {
    // ----------------------------------查看是否在Users表有用户记录-------------------------------------------
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    const db = wx.cloud.database()
    let that = this
    db.collection('Users').where({
      _openid: this.data._openid
    }).get({
      success: res => {
        console.log('[数据库] [查询Users表记录] 成功,返回对象为: ', res)
        let detailArray = []
        if (!res.data.length) { // 如果是新用户，在Users表中增加新user
          db.collection('Users').add({
            data: {
              _id: 'user' + that.data._openid,
              nickName: that.data.nickName,
              avatarUrl: that.data.avatarUrl,
              bloggers: detailArray,        //关注的博主
              fans:detailArray, 
            }
          }).then(res => {
            console.log('[数据库] [增加Users表记录] 成功,增加的对象为: ', res)
          })
        } else { // 如果是老用户更新一下最新用户名和昵称
          db.collection('Users').doc('user' + that.data._openid).update({
            data: {
              nickName: that.data.nickName,
              avatarUrl: that.data.avatarUrl
            }
          }).then((res) => {
            console.log('[数据库] [修改Users表记录] 成功,修改的对象为: ', res)
          })
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    wx.hideLoading()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 进入结果页 -> work
  goWork(){
    let _openid = this.data._openid
    if (!_openid) {
      console.log('内容为空')
      return
    }

    wx.navigateTo({
      url: `/pages/work/work?_openid=${_openid}`,
    })
  },

  // 进入结果页 -> look
  goLook() {
    let _openid = this.data._openid
    if (!_openid) {
      console.log('内容为空')
      return
    }
    wx.navigateTo({
      url: `/pages/look/look?_openid=${_openid}`,
    })
  },

    //进入结果页 -> blogger
    goBlogger(e){
      let flag=1
      wx.navigateTo({
        url: `/pages/blogger/blogger?authorId=${e.currentTarget.dataset.id}&flag=${flag}`,
      })
    },
  // 进入结果页 -> collect
  goCollect() {
    let _openid = this.data._openid
    if (!_openid) {
      console.log('内容为空')
      return
    }

    wx.navigateTo({
      url: `/pages/collect/collect?_openid=${_openid}`,
    })
  },

  // 进入结果页 -> comment
  goComment(){
    wx.navigateTo({
      url: `/pages/comment/comment`,
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
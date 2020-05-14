// pages/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      {
        id:'tvx06XsLsyuLRbumcGsuMrQLf2vMC2hF2oLDHcQMfVXYri73',
        url: '/images/food/banner1.jpg'
      }, {
        id:'8znFCk0AqP9xvaP0dVIQUcEzvfJfbNAs6EBvdwqXED3W0QVD',
        url: '/images/food/banner2.jpg'
      }
    ],
    indicatorDots: true,
    autoplay: true,
    indicatorColor: '#fedb00',
    interval: 2000,
    duration: 400,
    activeCategoryId: 1,
    category: [{
      id: "37",
      parentId: "1005",
      img: "/images/food/zao.png",
      name: '早餐'
    },
    {
      id: "38",
      parentId: "1005",
      img: "/images/food/wu.png",
      name: '午餐'
    },
    {
      id: "39",
      parentId: "1005",
      img: "/images/food/xiawu.png",
      name: '下午茶'
    },
    {
      id: "40",
      parentId: "1005",
      img: "/images/food/wan.png",
      name: '晚餐'
    },
    {
      id: "41",
      parentId: "1005",
      img: "/images/food/ye.png",
      name: '夜宵'
    }
    ],
    scroll: [{
      id: 1,
      parentId: "10001",
      img: "/images/food/ksc.jpg",
      name: '家常菜'
    },
    {
      id: 2,
      parentId: "10001",
      img: "/images/food/haixian1.jpg",
      name: '海鲜'
    },
    {
      id: 3,
      parentId: "10001",
      img: "/images/food/tpdx.jpg",
      name: '甜品点心'
    },
    {
      id: 4,
      parentId: "10001",
      img: "/images/food/tangzhou.jpg",
      name: '汤粥'
    }
    ],
    list: [],
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    _openid:''
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('index app.globalData.userInfo',app.globalData.userInfo)
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          //console('已授权1111')
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    // 获取用户openId
    this.onGetOpenid()
    
    this.loadList()
  },
  
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        this.setData({
          _openid:res.result.openid
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.showToast({
          icon: 'none',
          title: '获取 openid 失败，请检查是否有部署 login 云函数',
        })
      }
    })
  },
  //加载猜你喜欢部分的List
  loadList(){
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })
    // 从云数据库读取列表
    const db = wx.cloud.database();
    const MAX_LIMIT = 8
    let list=[]
    db.collection('Foods').limit(MAX_LIMIT).orderBy('count', 'desc').get().then(res => {
      console.log(res);
      if (res.data.length) {
        list.push(...res.data)
        this.setData({
          list
        })
        console.log(list)
      }
      wx.hideLoading()

    })
  },
  //跳转到搜索界面
  goSearch(e) {
    wx.navigateTo({
      url: `/pages/search/search`,
    })
  },
  //跳转到详情页，由id来确定
  goDetail(e) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}`,
    })
    console.log(e.currentTarget.dataset.id)
  },
  //跳转到分类检索界面，其他界面都关闭
  //跳转到tabbar界面只能用switchTab，navigateTo不行
  goSort(e) {
    wx.switchTab({
      url: `/pages/sort/sort`,
    })
  },
  goList(e) {
    console.log(e)
    wx.navigateTo({
      url: `/pages/list/list?content=${e.currentTarget.dataset.content}&tags=${e.currentTarget.dataset.tags}`,
    })
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
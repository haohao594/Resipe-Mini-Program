// miniprogram/pages/edit/edit.js
// miniprogram/pages/detail/detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    openid: '',
    _id:'',
    tags: [], // 标签
    ingredients: [], // 主料
    burden: [], // 辅料
    loading: true,
    logged: false,
    isExit: true, // 此菜品是否存在
    isCollect: true, // 菜品是否已收藏,true为未收藏
    isLook: false//是否浏览过，默认未浏览
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('我是个opption', options)
    let isLogin = wx.getStorageSync('isLogin')
    this.loadDetail(options.id) // 加载详情

    this.setData({
      logged: isLogin ? true : false,
      _id: options.id
    })

    console.log(this.data.logged)

    // 是否存在用户的openId
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
      console.log('看看', this.data.openid)
    }
    
  },

  //加载详情页
  loadDetail(param) {
    //let that = this
    wx.showLoading({
      title: '详情加载中...',
    })
    // 从云数据库读取列表
    const db = wx.cloud.database()
    let that = this
    const _ = db.command
    console.log('55555555555-', param)
    db.collection('Foods').where({
      _id: param//param即为传入detail的option.id
      //openId: this.data.openid
    }).get({
      success: res => {
        //console.log('[数据库] [查询记录] 成功: ', res)
        //console.log(res.data.length)
        if (res.data.length) {
          console.log(12345)
          //console.log(res.data[0])
          //console.log(res.data[0].ingredients.split(',').join('：').split(';'))
          //console.log(res.data[0].burden.split(',').join('：').split(';'))
          that.setData({
            detail: res.data[0],
            tags: res.data[0].category,
            ingredients: res.data[0].ingredients,
            burden: res.data[0].burden
            // ingredients: res.data[0].ingredients.split(',').join('：').split(';'),
            // burden: res.data[0].burden.split(',').join('：').split(';')
          })
          console.log(111111)
          wx.setNavigationBarTitle({
            title: res.data[0].title
          })
        } else {
          console.log('该id为空')
          that.setData({
            isExit: false
          })
        }
        wx.hideLoading();
      },
      fail: res => {
        console.log('查询失败')
        wx.hideLoading();
      }
    },
      console.log("this.data.detail.id"),
      console.log(this.data.detail.id)
    )
  },

  //修改简介
  onChangeDesc(e){
    console.log(e.detail)
    this.setData({
      ['detail.desc']: e.detail
    })
  },
  //修改主料
  onChangeIngredients(e) {
    console.log(e.detail)
    this.setData({
      ingredients: e.detail
    })
    console.log('ingredients', this.data.ingredients)
  },

  //修改辅料
  onChangeBurden(e) {
    console.log(e.detail)
    this.setData({
      burden: e.detail
    })
    console.log('burden', this.data.burden)
  },

  //修改步骤
  bindText(e) {
    const index = parseInt(e.currentTarget.dataset.index)
    console.log(index)
    console.log(e.detail)
    const text = "detail.steps[" + index + "].step"
    this.setData({
      [text]: e.detail
    })
    console.log('detail',this.data.detail)
  },

  //提交菜谱信息
  submit() {
    var that = this
    const db = wx.cloud.database()
    db.collection('Foods').doc(that.data._id).update({
      data: {
        desc: that.data.detail.desc,
        ingredients:that.data.ingredients,
        burden:that.data.burden,
        steps:that.data.detail.steps
      }
    }).then((res) => {
      wx.showToast({
        title: '修改菜谱成功',
      })
      console.log(res)
    })
  },
  // 登录授权
  getUser(e) {
    console.log(e);
    wx.getUserInfo({
      success: (res) => {
        console.log(res)
        wx.setStorageSync('isLogin', 'isLogin')
        this.setData({
          logged: true
        })
      }
    })
  },

  onBackhome() {
    wx.switchTab({
      url: `/pages/index/index`,
    })
  },
  
  // //跳转到个人详情页--可查看博主的创作、收藏
  // goBlogger(e) {
  //   wx.navigateTo({
  //     url: `/pages/blogger/blogger?authorId=${e.currentTarget.dataset.id}`,
  //   })
  // },
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
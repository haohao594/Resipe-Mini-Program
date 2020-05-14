// miniprogram/pages/comment/comment.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _openid:'',
    list:[]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      _openid:app.globalData._openid
    })

    this.loadComment()
  },

  //加载评论
  loadComment() {
    let list1 = []
    // 从Comments表中读取该菜谱的评论
    const db = wx.cloud.database();
    db.collection('Comments').where({
      _openid: this.data._openid
    }).orderBy('insertTime', 'desc').get().then(res => {
      console.log('[数据库] [读取Comments表记录] 成功,读取的对象为: ', res)
      if (res.data.length) {
        list1.push(...res.data)
        this.setData({
          list: list1
        })
      }
    })
  },
  //删除评论
  comment_delete(e) {
    let that = this
    const db = wx.cloud.database()
    //找到对应菜谱进行删除
    db.collection('Comments').where({
      _id: e.currentTarget.dataset.id
    }).remove({
      success: function (res) {
        console.log("[数据库][删除相应评论]成功", res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    this.loadComment()
  },

  goDetail(e) {
    console.log('detail');
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}`,
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
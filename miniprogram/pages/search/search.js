// pages/search/search.js
const app = getApp() 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputValue: '',
    _openid: '',
    showHistory: true,
    historyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('是否已有用户_openid：', app.globalData._openid)
    // 是否存在用户的_openid
    if (app.globalData._openid) {
      this.setData({
        _openid: app.globalData._openid
      })
    }
    console.log('是否已有用户_openid：', app.globalData._openid)

    this.getHistory()

  },

  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
    console.log(this.data.inputValue)
  },
  // 进入搜索结果页 -> list
  goList() {
    let content = this.data.inputValue
    if (!content) {
      console.log('内容为空')
      return
    }

    this.onHistory(content)//查询前判断是否在记录中，不在则加入

    wx.navigateTo({
      url: `/pages/list/list?content=${content}`,
    })
  },

  // 添加历史记录
  
  onHistory(content){
    const db = wx.cloud.database()
    let that = this
    
    // 查看是否有历史记录
    db.collection('searchHistorys').where({
      _openid: this.data._openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        if (!res.data.length) {
          console.log(' 历史记录为空')
          let historyArray = []
          historyArray.unshift(content)
          db.collection('searchHistorys').add({
            data: {
              _id: 'history' + that.data._openid,
              // _openid: that.data._openid,
              //description: 'history',
              historyList: historyArray
            }
          }).then(res => {
            console.log(res)
          })
        } else {
          console.log('已有历史记录')
          let historyArray = res.data[0].historyList
          historyArray.unshift(content)//往数组开头添加元素
          console.log([...new Set(historyArray)])
          db.collection('searchHistorys').doc('history' + that.data._openid).update({
            data: {
              historyList: [...new Set(historyArray)]
            }
          }).then((res) => {
            console.log(res)
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
  },
  // 读取历史记录
  getHistory() {
    let that = this
    const db = wx.cloud.database()
    db.collection('searchHistorys').doc('history' + that.data._openid).get({
      success(res) {
        console.log(res.data)
        that.setData({
          historyList: res.data.historyList
        })
      }
    })
  },
  //点击记录直接查询
  historyGoSearch(e) {
    console.log(e)
    let content = e.currentTarget.dataset.title
    wx.navigateTo({
      url: `/pages/list/list?content=${content}`,
    })
  },
  // 清空历史记录
  bindClearHistory() {
    const db = wx.cloud.database()
    db.collection('searchHistorys').doc('history' + this.data._openid).update({
      data: {
        historyList: []
      }
    }).then((res) => {
      console.log(res)
      wx.showToast({
        icon: '删除',
        title: '清空历史',
      })
    })

    this.setData({
      historyList: []
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
    this.getHistory()
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
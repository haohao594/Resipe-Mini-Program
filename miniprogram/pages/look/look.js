// miniprogram/pages/look/look.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    index: 0, // 页码起始下标
    num: 10, // 每页展示个数
    searchContent: '', // 搜索内容或者搜索标签id
    searchIsTags: false, // 是否搜索的是标签id
    loading: false, // 是否正在加载
    isOver: false, // 滑动到底
    noList: false // 搜索结果为空
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "我的浏览记录" //页面标题为路由参数
    })

    this.loadLook(options._openid)
  },

  //加载Look界面
  loadLook(content){
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    if (!this.data.isOver) {
      let { list, index, num } = this.data;
      wx.showLoading({
        title: '正在加载...',
        mask: true
      });
      this.setData({
        loading: true
      });

      // 从云数据库读取列表
      const db = wx.cloud.database();
      const MAX_LIMIT = 8
      db.collection('lookHistorys').where({
        _openid: content
      }).get().then(res => {
        console.log(res);
        if (res.data.length) {
          list.push(...res.data[0].lookList)
          console.log(...res.data[0].lookList)
          //对list进行处理，清除空数据后再展示
          list.map((val, index) => {
            if (!val._id) {
              list.splice(index, 1)
            }
          })
          this.setData({
            list,
            loading: false,
            searchContent: content
          })
          console.log(list)
        } else {
          this.setData({
            loading: false,
            isOver: true
          })
          wx.showToast({
            icon: 'none',
            title: '还没有浏览记录噢'
          })
        }
        wx.hideLoading()

      })

    }
  },
  //删除该浏览记录
  delete(e){
    console.log('e',e.target.dataset.index)
    const db = wx.cloud.database()
    let that = this
    let i=e.target.dataset.index
    let lookList=[]
    db.collection('lookHistorys').where({
      _openid: app.globalData._openid
    }).get({
      success: res =>{
        console.log('[数据库lookHistorys] [查询记录] 成功: ', res)
        lookList=res.data[0].lookList
        console.log('i',i)
        lookList.splice(i,1)

        db.collection('lookHistorys').where({
          _openid: app.globalData._openid
        }).update({
          data: {
            lookList: lookList
          }
        }).then((res) => {
          console.log(res)
        })
      }
    })
    this.setData({
      list:[]
    })
    setTimeout(function () {
      that.loadLook(app.globalData._openid)
    }, 500)
    // that.loadLook(app.globalData._openid)
  },
  //跳转到详情页
  goDetail(e) {
    console.log('detail');
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}`,
    })
  },
  // 上拉加载
  lower() {
    console.log('lower');
    if (!this.data.loading) {
      this.loadLook(this.data.searchContent)
    }
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
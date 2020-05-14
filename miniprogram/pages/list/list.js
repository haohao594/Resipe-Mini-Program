// miniprogram/pages/list/list.js
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
      title: options.content //页面标题为路由参数
    })
    console.log("111",options)
    if (options.tags) {//js不支持函数的重载，只能用if来实现重载功能
      //tag存在是分类页面进来的
      this.data.searchContent = options.content
      this.data.searchIsTags = true
      this.loadList1(options.content)
    } else {
      //tag不存在说明是搜索栏直接搜索的
      this.data.searchContent = options.content
      this.loadList2(options.content)
    }
  },

  // 加载列表，从分类处进入
  loadList1(content) {
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
      db.collection('Foods').skip(index).limit(MAX_LIMIT).where({
        category: content
      }).get().then(res => {
        console.log(res);
        if (res.data.length) {
          list.push(...res.data)
          this.setData({
            list,
            index: index + MAX_LIMIT,
            loading: false
          })
          wx.hideLoading()
          console.log(list)
        } else {
          wx.hideLoading()
          this.setData({
            loading: false,
            isOver: true
          })
        }
      })
    }
  },
  // 加载列表，从搜索栏直接进入
  loadList2(content) {
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
      db.collection('Foods').skip(index).limit(MAX_LIMIT).where({
        //title: content
        //实现模糊查询
        title:db.RegExp({
          regexp:content
        })
      }).get().then(res => {
        console.log(res);
        if (res.data.length) {
          list.push(...res.data)
          this.setData({
            list,
            index: index + MAX_LIMIT,
            loading: false
          })
          console.log(list)
        } else {
          this.setData({
            loading: false,
            isOver: true
          })
        }
        wx.hideLoading()
      })
    }
  },

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
      if (this.data.searchIsTags) {
        this.loadList1(this.data.searchContent)
      } else {
        this.loadList2(this.data.searchContent)
      }
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
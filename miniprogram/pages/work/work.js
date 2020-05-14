// miniprogram/pages/work/work.js
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
    noList: false, // 搜索结果为空
    _openid:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "我的独家创作" //页面标题为路由参数
    })
    this.setData({
      _openid: options._openid
    })
    this.loadWook(options._openid)
  },

  //加载Wook界面
  loadWook(content) {
    this.setData({
      _openid: app.globalData._openid,
      list: []
    })
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
      // 从Foods表中读取该用户独创菜谱
      const db = wx.cloud.database();
      const MAX_LIMIT = 8
      db.collection('Foods').skip(index).limit(MAX_LIMIT).where({
        _openid: content,
        limit:0
      }) .orderBy('_openid', 'desc').get().then(res => {
        console.log('[数据库] [读取Foods表记录] 成功,读取的对象为: ', res)
        if (res.data.length) {
          list.push(...res.data)
          this.setData({
            list,
            index: index + MAX_LIMIT,
            loading: false,
            searchContent: content
          })
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

  //跳转到uploading界面
  goUplaoding(e) {
    wx.navigateTo({
      url: `/pages/uploading/uploading`,
    })
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

  //跳转到编辑页面、编辑页面以detail页面为原型加以修改
  edit(e){
    console.log('edit');
    console.log(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: `/pages/edit/edit?id=${e.currentTarget.dataset.id}`,
    })
  },

  //删除操作
  delete(e) {
    console.log('delete');
    console.log(e.currentTarget.dataset.id);
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    //找到对应菜谱进行删除
    db.collection('Foods').where({
      _id: e.currentTarget.dataset.id
    }).update({
      data: {
        limit: 1
      }
    }).then((res) => {
      console.log('[数据库] [修改Foods表记录] 成功,修改的对象为: ', res)
    })
    this.reload()
  },
  //重新加载
  reload(){
    this.setData({
      index:0
    })
    this.loadWook(app.globalData._openid)
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
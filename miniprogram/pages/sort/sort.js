Page({
  data: {
    cateItems: [],
    curNav: 1,
    curIndex: 0
  },

  //  * 生命周期函数--监听页面加载
  //  */
  onLoad: function (options) {
    this.loadList() 
  },
  //加载列表数据
  loadList(){
    //let that = this
    // const db = wx.cloud.database()
    // const _ = db.command
    let { cateItems } = this.data;
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })

    // 从云数据库读取列表
    const db = wx.cloud.database();
    db.collection('Categorys').get().then(res => {
      console.log(res);
      if (res.data.length) {
        cateItems.push(...res.data)
        this.setData({
          cateItems
        })
        console.log(cateItems)
      }
      wx.hideLoading()
      })
  },

  //事件处理函数  
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值  
    let id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index);
    // 把点击到的某一项，设为当前index  
    this.setData({
      curNav: id,
      curIndex: index
    })
  },
  //跳转到List
  goList(e) {
    console.log(e)
    wx.navigateTo({
      url: `/pages/list/list?content=${e.currentTarget.dataset.content}&tags=${e.currentTarget.dataset.tags}`,
    })
  },
  //跳转到搜索界面
  goSearch(e) {
    wx.navigateTo({
      url: `/pages/search/search`,
    })
  }
})



// // miniprogram/pages/sort/sort.js

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {
//     list: []
//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {
//     this.loadList() 
//   },

//   // 获取列表数据
//   loadList() {
//     let { list } = this.data;
//     wx.showLoading({
//       title: '正在加载...',
//       mask: true
//     });
//     this.setData({
//       loading: true
//     });

//     // 从云数据库读取列表
//     //是否需要新建一个菜品分类表，饭后再考虑
//     //搞半天数据取不出来，记得修改相应数据库权限
//     const db = wx.cloud.database();
//     //let that = this
//     db.collection('Categorys').get({
//           success: res =>{
//             list.push(...res.data)
//             this.setData({
//               list
//             })
//             console.log(list)
//             wx.hideLoading()
//           },
//           fail: err => {
//             wx.showToast({
//               icon: 'none',
//               title: '查询记录失败'
//             })
//             console.error('[数据库] [查询记录] 失败：', err)
//           }
//       })
//   },
//   goList(e) {
//     console.log(e)
//     wx.navigateTo({
//       url: `/pages/list/list?content=${e.currentTarget.dataset.content}&tags=${e.currentTarget.dataset.tags}`,
//     })
//   },
//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })
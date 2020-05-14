// miniprogram/pages/blogger/blogger.js
const app = getApp()
let userInfo = app.globalData.userInfo;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:"0",//若为1则是从home页面跳转来的
    bloggersMessage1:{},
    fansMessage1: {},
    authorId:'',//博主的openid
    nickName: '',//从users表里面获取
    avatarUrl: '',
    tabbar: ['菜谱', '收藏','关注','粉丝'],
    currentTab: 0,
    collectlist: [],
    worklist:[],
    bloggersArray:[],
    bloggerslist:[],
    fansArray:[],
    fanslist:[],
    index0:100000000,//记住该博主在用户的bloggers中的位置
    index3:100000000,//记住该用户在博主的fans中的位置
    index1: 0, // 独家秘传页码起始下标
    index2: 0, // 收藏菜谱页码起始下标
    num: 10, // 每页展示个数
    loading: false, // 是否正在加载
    isOver: false, // 滑动到底
    noList: false,// 搜索结果为空
    isfocus:0,//0为尚未关注该博主，1为已关注
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if(options.flag=="1"){
      this.setData({
        flag:options.flag
      })
    }
    if(options.authorId==app.globalData.openid){
      this.setData({
        flag:1
      })
    }
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    var that = this
    this.setData({
      authorId: options.authorId
      // avatarUrl: app.globalData.userInfo.avatarUrl,
      //nickName: options.authorName
    })
    console.log('authorId:', this.data.authorId)
    
    const db = wx.cloud.database();
    db.collection('Users').where({
      _openid: that.data.authorId
    }).get({
      success:res=>{
        console.log('res', res);
        that.setData({
          nickName: res.data[0].nickName,
          avatarUrl: res.data[0].avatarUrl
        })
        setTimeout(() => {
          that.judgeIsfocus()
          console.log('判断是否关注')
        }, 0)
      }
    })
    wx.hideLoading()
    that.loadWork(that.data.authorId)
    
    // setTimeout(function () {
    //   that.judgeIsfocus()
    // }, 5000)
  },

  // //跳转到创作界面
  // goUploading(){
  //   wx.navigateTo({
  //     url: `/pages/uploading/uploading`,
  //   })
  // },

  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.currentTarget.dataset.current;
    console.log('cur',cur)
    console.log('this.data.currentTab', this.data.currentTab)
    if (this.data.currentTab == cur) {
      return false;
    }

    this.setData({
      currentTab: cur
    })
    console.log('cur', cur)
    console.log('this.data.currentTab', this.data.currentTab)

    if (this.data.currentTab == 0) {
      this.setData({
        worklist: []
      })
      this.loadWork(this.data.authorId)

    } else if (this.data.currentTab == 1) {
      this.setData({
        collectlist: []
      })
      this.loadCollect(this.data.authorId)
    }
    else if(this.data.currentTab == 2){
      this.setData({
        bloggerslist: []
      })
      this.loadbloggers(this.data.authorId)
    }
    else{
      this.setData({
        fanslist: []
      })
      this.loadfans(this.data.authorId)
    }
  },


  //加载collect界面
  loadCollect(content) {
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    if (!this.data.isOver) {
      let { collectlist, index2, num } = this.data;
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
      db.collection('Collections').skip(index2).limit(MAX_LIMIT).where({
        _openid: content
      }).get().then(res => {
        console.log(res);
        if (res.data.length) {
          collectlist.push(...res.data[0].collectList)
          this.setData({
            collectlist,
            index: index2 + MAX_LIMIT,
            loading: false,
            searchContent: content
          })
          console.log(collectlist)
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

  //加载独家菜谱界面
  loadWork(content){
    let that = this
    const db = wx.cloud.database()
    const _ = db.command
    if (!this.data.isOver) {
      let { worklist, index1, num } = this.data;
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
      db.collection('Foods').skip(index1).limit(MAX_LIMIT).where({
        _openid: content,
        limit:0
        //后期再加上limit字段加以限制
      }).get().then(res => {
        console.log(res);
        if (res.data.length) {
          worklist.push(...res.data)
          this.setData({
            worklist,
            index: index1 + MAX_LIMIT,
            loading: false,
            searchContent: content
          })
          console.log(worklist)
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
 
  //加载关注的博主界面
  loadbloggers(content) {
    let that = this
    const db = wx.cloud.database()
    wx.showLoading({
      title: '正在加载...',
      mask: true
    });
    // 从云数据库读取列表
    db.collection('Users').where({
      _openid: content
      //后期再加上limit字段加以限制
    }).get().then(res => {
      console.log(res);
      if (res.data.length) {
        let bloggerslist = that.data.bloggerslist
        bloggerslist.push(...res.data[0].bloggers)
        that.setData({
          bloggerslist: bloggerslist
        })
        console.log('bloggerslist',bloggerslist)
      } else {
        console.log('暂无')
      }
      wx.hideLoading()
    })

    
  },
//加载粉丝界面
loadfans(content) {
  let that = this
  const db = wx.cloud.database()
  wx.showLoading({
    title: '正在加载...',
    mask: true
  });
  // 从云数据库读取列表
  db.collection('Users').where({
    _openid: content
    //后期再加上limit字段加以限制
  }).get().then(res => {
    console.log(res);
    if (res.data.length) {
      let fanslist = that.data.fanslist
      fanslist.push(...res.data[0].fans)
      that.setData({
        fanslist: fanslist
      })
      console.log('fanslist',fanslist)
      console.log('data.fanslist',that.data.fanslist)
    } else {
      console.log('暂无')
    }
    wx.hideLoading()
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
  //进入结果页 -> blogger
  goBlogger(e){
    wx.navigateTo({
      url: `/pages/blogger/blogger?authorId=${e.currentTarget.dataset.id}`,
    })
  },
  // 上拉加载
  lower() {
    console.log('lower');
    if (!this.data.loading) {
      this.loadLook(this.data.searchContent)
    }
  },

  //判断是否已关注博主
  judgeIsfocus(){
    const db = wx.cloud.database()
    let that = this

    db.collection('Users').where({
      _openid: app.globalData._openid
    }).get({
      success: res=>{
        console.log('bloggers表app.globalData._openid',res)
        if(res.data[0].bloggers.length>0){
          that.setData({
            bloggersArray: res.data[0].bloggers
          })
          // this.data.bloggersArray.push(res.data[0].bloggers)
          that.data.bloggersArray.map((val, index) => {
            if (val.authorId == that.data.authorId) {
              that.setData({
                isfocus:1,
                index0:index
              })
              console.log('index',index)
            }
          })
        }else{
          console.log('空的，还没关注人呐')
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
    console.log('this.data._openid',this.data.authorId)
    db.collection('Users').where({
      _openid: this.data.authorId
    }).get({
      success: res=>{
        console.log('bloggers表this.data.authorId',res)
        if(res.data[0].fans.length>0){
          that.setData({
            fansArray: res.data[0].fans
          })

          that.data.fansArray.map((val, index) => {
            if (val.authorId == app.globalData._openid) {
              that.setData({
                index3:index
              })
              console.log('index',index)
            }
          })
        }else{
          console.log('还没有粉丝')
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

    

    const bloggersMessage1=this.data.bloggersMessage1
    const fansMessage1 = this.data.fansMessage1
    this.setData({
      ['bloggersMessage1.authorId']: that.data.authorId,
      ['bloggersMessage1.nickName']: that.data.nickName,
      ['bloggersMessage1.avatarUrl']: that.data.avatarUrl,
      ['fansMessage1.authorId']: app.globalData._openid,
      ['fansMessage1.nickName']: app.globalData.userInfo.nickName,
      ['fansMessage1.avatarUrl']: app.globalData.userInfo.avatarUrl,
    })
    setTimeout(() => {
      console.log('that.data.bloggersMessage1',that.data.bloggersMessage1)
      console.log('that.data.fansMessage1',that.data.fansMessage1)
    }, 0)

  },

  //关注博主-更新Users表
  focus(){
    let that = this
    const db = wx.cloud.database()
    this.data.bloggersArray.unshift(this.data.bloggersMessage1)
    this.data.fansArray.unshift(this.data.fansMessage1)
    // this.data.bloggersArray.push(this.data.bloggersMessage1)
    //用户方更新bloggers
    db.collection('Users').doc('user' + app.globalData._openid).update({
      data: {
        bloggers: this.data.bloggersArray
      }
    }).then((res) => {
      console.log('[数据库] [更新Users表bloggers属性] 成功',res)
      that.setData({
        isfocus: 1
      })
    }) 
    //被关注方更新fans
    db.collection('Users').doc('user' + that.data.authorId).update({
      data: {
        fans: this.data.fansArray
      }
    }).then((res) => {
      console.log('[数据库] [更新Users表fans属性] 成功',res)
    })
    //用完一次后将bloggersArray,fansArray置空
    setTimeout(() => {
      that.setData({
        bloggersArray:[],
        fansArray:[]
      })
    }, 0)
  },

  //取消关注博主
  cancelFocus(){
    this.judgeIsfocus()
    let that = this
    let bloggersArray = this.data.bloggersArray
    let fansArray = this.data.fansArray

    bloggersArray.splice(this.data.index0, 1)
    fansArray.splice(this.data.index3, 1)
    const db = wx.cloud.database()
    //用户方更新bloggers
    db.collection('Users').doc('user' + app.globalData._openid).update({
      data: {
        bloggers: bloggersArray
      }
    }).then((res) => {
      console.log('[数据库] [更新Users表bloggers属性] 成功', res)
      that.setData({
        isfocus: 0
      })
    })
    //博主方更新fans
    db.collection('Users').doc('user' + that.data.authorId).update({
      data: {
        fans: fansArray
      }
    }).then((res) => {
      console.log('[数据库] [更新Users表fans属性] 成功', res)
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
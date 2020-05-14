// miniprogram/pages/detail/detail.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    _id:'',
    _openid: '',
    tags: [], // 标签
    ingredients: [], // 主料
    burden: [], // 辅料
    loading: true,
    logged: false,
    isExit: true, // 此菜品是否存在
    isCollect: true, // 菜品是否已收藏,true为未收藏
    isLook:false,//是否浏览过，默认未浏览
    count:1,
    message:'',//用户自己输入的评论
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载，option中用id字段存着菜谱的_id
   */
  onLoad: function (options) {
    let isLogin = wx.getStorageSync('isLogin')
    this.loadDetail(options.id) // 加载详情
    var that = this
    //wx.setStorageSync('shareId', options.id)

    this.setData({
      _id: options.id,
      logged: isLogin ? true : false,
      _openid: app.globalData._openid
    })

    setTimeout(function () {
      that.getcollect(options.id), // 获取收藏菜品，并判断是否已收藏 
      that.loadComment()
    }, 100)

    this.onLook()//添加浏览记录

    setTimeout(function () {
      that.updateCount(options.id)//更新浏览数量
    }, 1000)
    
  },

  //加载详情页
  loadDetail(param) {
    wx.showLoading({
      title: '详情加载中...',
    })
    // 从云数据库读取列表
    const db = wx.cloud.database()
    let that = this
    const _ = db.command
    db.collection('Foods').where({
      _id: param//param即为传入detail的option.id
    }).get({
      success: res=> {   
        console.log('[数据库] [读取Foods表记录] 成功,读取的对象为: ', res)
        if (res.data.length) {
          that.setData({
            detail: res.data[0],
            count: res.data[0].count,
            tags: res.data[0].category,
            ingredients: res.data[0].ingredients.split(',').join('：').split(';'),
            burden: res.data[0].burden.split(',').join('：').split(';')
          })
          //修改小程序顶部title
          wx.setNavigationBarTitle({
            title: res.data[0].title
          })
        } else {
          console.log('[数据库] [读取Foods表记录] 成功，不存在符合条件数据，后期应向用户做出提示')
          that.setData({
            isExit: false
          })
        }
        wx.hideLoading();
      },
      fail:res=> {
        console.log('[数据库] [读取Foods表记录] 失败')
        wx.hideLoading();
      }
    }
    )
  },


  // 读取收藏列表,详情页的收藏图标的展示
  getcollect(param) {
    let that = this
    // 先检查是否获取_openid，若未获取则调用login云函数获取
    if (!this.data._openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('取到_openid：', res.result)
          app.globalData._openid = res.result.openid
          that.setData({
            _openid: res.result.openid
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 _openid 失败，请检查是否有部署 login 云函数',
          })
          console.log('[云函数] [login] 获取 _openid 失败，请检查是否有部署云函数，错误信息：', err)
        }
      })
    }
    //////////////////////////////////////////////////////////////////////////
    const db = wx.cloud.database()
    // 查看是否有收藏记录
    db.collection('Collections').where({
      _openid: that.data._openid
    }).get({
      success: res => {
        if (!res.data.length) { // 如果从未收藏
          console.log('[数据库] [查询Collections表记录] 成功,读取0条数据 ')
        } else { // 如果已有收藏记录
          console.log('[数据库] [查询Collections表记录] 成功,读取到数据：', res)
          let detailArray = res.data[0].collectList
          let flag = false
          // 判断已有的收藏记录中是否已经收藏了此菜品
          detailArray.map((val, index) => {
            if (val._id == param) {
              flag = true
            }
          })
          that.setData({
            isCollect: !flag
          })
        }
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.log('[数据库] [查询Collections表记录] 失败', res)
      }
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
  // 授权后可以收藏
  bindCollect() {
    let that = this

    that.onCollect()

    wx.vibrateLong({
      success: res => {
        console.log('震动成功');
      },
      fail: (err) => {
        console.log('震动失败');
      }
    })

    if (that.data.isCollect) {
      wx.showToast({
        icon: '收藏',
        title: '收藏成功',
      })
    } else {
      wx.showToast({
        icon: '收藏',
        title: '已经取消收藏',
      })
    }
  },
  // 收藏
  onCollect() {
    const db = wx.cloud.database()
    let that = this

    // 查看是否有收藏记录
    db.collection('Collections').where({
      _openid: this.data._openid
    }).get({
      success: res => {
        console.log('[数据库] [查询Collections表记录] 成功', res)
        let like = that.data.detail // 需要收藏的菜品
        delete like._openid

        if (!res.data.length) { // 如果从未收藏
          console.log(' 从未收藏')
          let detailArray = []
          detailArray.unshift(like)//插在前面
          // detailArray.push(like)
          db.collection('Collections').add({
            data: {
              _id: 'collect' + that.data._openid,
              description: 'like',
              collectList: detailArray
            }
          }).then(res => {
            console.log(res)
          })
        } else { // 如果已有收藏记录
          let detailArray = res.data[0].collectList
          let i = 0
          let flag = false

          // 判断已有的收藏记录中是否已经收藏了此菜品
          detailArray.map((val, index) => {
            if (val._id == like._id) {
              i = index
              flag = true
            }
          })

          that.setData({
            isCollect: flag
          })

          that.data.isCollect ? detailArray.splice(i, 1) : detailArray.unshift(like)

          db.collection('Collections').doc('collect' + that.data._openid).update({
            data: {
              collectList: detailArray
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

  

  // 浏览记录
  onLook() {
    const db = wx.cloud.database()
    let that = this

    // 查看是否有浏览记录
    db.collection('lookHistorys').where({
      _openid: this.data._openid
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        let like = that.data.detail // 需要收录浏览记录的菜品
        //delete like._id
        delete like._openid

        if (!res.data.length) { // 如果从未浏览，则新建用户浏览记录
          console.log(' 从未浏览')
          let detailArray = []
          detailArray.unshift(like)//插在前面
          // detailArray.push(like)//插在后面
          db.collection('lookHistorys').add({
            data: {
              _id: 'look' + that.data._openid,
              //description: 'look',
              lookList: detailArray
            }
          }).then(res => {
            console.log(res)
          })
        } else { // 如果已有浏览记录
          let detailArray = res.data[0].lookList
          let i = 0
          let flag = false

          // 判断已有的浏览记录中是否已经浏览了此菜品
          detailArray.map((val, index) => {
            if (val._id == like._id) {
              i = index
              flag = true
            }
          })
          
          that.setData({ 
            isLook: flag
          })
          
          if (that.data.isLook){
            detailArray.splice(i, 1)
            detailArray.unshift(like)//插在前面
            // detailArray.push(like)
          }else{
            detailArray.unshift(like)//插在前面
            // detailArray.push(like)
          }

          db.collection('lookHistorys').doc('look' + that.data._openid).update({
            data: {
              lookList: detailArray
            }
          }).then((res) => {
            console.log('[数据库] [更新lookHistorys表] 成功')
          })

          // // 清除已有的浏览记录中list中的空项-验证无效
          // detailArray.map((val, index) => {
          //   if (!val.foodId) {
          //     i = index
          //     console.log('数组第', index,'项数据为空，清理掉')
          //     detailArray.splice(i, 1)
          //   }
          // })
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
  //count++
  updateCount(param){
    const db = wx.cloud.database()
    let that = this
    const index = 1
    db.collection('Foods').doc(param).update({
      data: {
        count: this.data.count + index
      }
    }).then((res) => {
      console.log(res)
    })
    console.log('count',this.data.count)
  },

  onBackhome(){
    wx.switchTab({
      url: `/pages/index/index`,
    })
  },
  //跳转到个人详情页--可查看博主的创作、收藏
  goBlogger(e){
    if(e.currentTarget.dataset.id){
      wx.navigateTo({
        url: `/pages/blogger/blogger?authorId=${e.currentTarget.dataset.id}`,
      })
    }
    
  },

  //绑定comment里的数据到message中
  bindTitle(e) {
    console.log(e)
    this.setData({
      message: e.detail.value
    })
  },
  //提交评论
  submitComment(e){
    console.log(this.data.message)

    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //获取年月日时分秒
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    var minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    var second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
    const Time = Y + '年' + M + '月' + D + '日' + hour + ':' + minute + ':' + second
    console.log("当前时间:" ,Time);
    
    const db = wx.cloud.database()

    db.collection('Comments').add({
      data: {
        authorName: this.data.nickName,
        content: this.data.message,
        target_id: this.data._id,//评论的对象，就是当前菜谱的_id
        target_img: this.data.detail.albums[0],
        target_title: this.data.detail.title,
        insertTime: Time,
        comment_AuthorName:app.globalData.userInfo.nickName,
        comment_AuthorUrl: app.globalData.userInfo.avatarUrl

      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        console.log('res._id',res._id)
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        this.setData({
          message:''
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
    let that=this
    setTimeout(function () {
      that.loadComment()
    }, 500)
  },

  //加载评论
  loadComment(){
    let list1=[]
    // 从Comments表中读取该菜谱的评论
    const db = wx.cloud.database();
    db.collection('Comments').where({
      target_id: this.data._id
    }).orderBy('insertTime', 'desc').get().then(res => {
      console.log('[数据库] [读取Comments表记录] 成功,读取的对象为: ', res)
      if (res.data.length) {
        list1.push(...res.data)
        this.setData({
          list:list1
        })
      } 
    })
  },
  //删除评论
  comment_delete(e){
    let that = this
    const db = wx.cloud.database()
    //找到对应菜谱进行删除
    db.collection('Comments').where({
      _id: e.currentTarget.dataset.id
    }).remove({
      success: function (res) {
        console.log("[数据库][删除相应评论]成功",res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '删除记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
    
    setTimeout(function () {
      that.loadComment()
    }, 500)
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
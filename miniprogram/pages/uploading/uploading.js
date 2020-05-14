// miniprogram/pages/uploading/uploading.js
const app = getApp()
let userInfo = app.globalData.userInfo;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _openid:'',//图片上传到云用作唯一标识的部分
    nickName:'',
    flag:0,
    //authorId: '',//用户_openid，自动获取
    authorName:'',//昵称，自动获取
    title:'',//菜品名
    desc:'',//菜品简介
    tags: [], // 标签，需用户选择，搞个下拉列表框，对应category表签
    tagsFlag:false,
    ingredients: [], // 主料，需用户输入
    burden: [], // 辅料，需用户输入
    count:'',
    steps:[{
      img: '',
      step: ''
    }],
    images: [],//封面图片
    cloudImages:[],
    stepImages: [],//步骤图片
    cloudstepImages:[],
    stepNum:1,
    // 下面三个变量都为菜品类别使用
    cateItems:[],
    curNav: 1,
    curIndex: 0,

    foodId:''

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadItems()
    this.setData({
      _openid: app.globalData._openid,
      nickName: app.globalData.userInfo.nickName
    })
    console.log('this.data._openid',this.data._openid)
    console.log(this.data.nickName)
  },

  //初始化分类标签中的数据
  loadItems(){
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

  //打开关闭tags
  openTags(){
    if(this.data.tagsFlag){
      this.setData({
        tagsFlag:false
      })
    }else{
      this.setData({
        tagsFlag: true
      })
    }
  },

  //删除标签
  deleteTag(e){
    var index = e.target.dataset.index;
    var tags = this.data.tags;
    tags.splice(index,1)
    this.setData({
      tags: tags
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

  //往tags里添加数据----------------------------后期加上 不重复  约束
  addTags(e){
    let { tags } = this.data;
    const newtags = this.data.tags
    newtags.push(e.currentTarget.dataset.content)
    this.setData({
      tags: newtags
    })
    console.log('tags', this.data.tags)
    //这是text
    //e.currentTarget.dataset.content
  },

  //选择封面图片，将临时路径存入images数组
  chooseImage(e) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success:res=> {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
        console.log(this.data.images)
      }
    })
  },

  //移除选中的封面图片
  removeImage(e) {
    this.setData({
      images: this.data.images.splice(1, 1)//删除已选中的图片
    })
    console.log(this.data.images)
  },

  //添加步骤图片,并把临时路径存入step.img和stepImages中
  chooseStepsImage(e){
    var that=this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片,但只是临时路径
        const tempFilePaths = res.tempFilePaths
        const index=parseInt(e.currentTarget.dataset.index)
        console.log('e.currentTarget.dataset.index',e.currentTarget.dataset.index)
        //const up ="steps[" + index + "].img"
        const up1 = "stepImages[" + index + "]"
        this.setData({
          [up1]: tempFilePaths
          //[up]: tempFilePaths
        })
        console.log('e', e)
        console.log('this.data.stepImages',this.data.stepImages)
        //console.log('up',up)
        console.log('up1', up1)
        console.log('this.data.steps',this.data.steps)
      }
    })
  },

  //绑定title里的数据到title中
  bindTitle(e) {
    console.log(e.detail)
    this.setData({
      title: e.detail
    })
  },

  //绑定desc里的数据到desc中
  bindDesc(e) {
    console.log(e.detail)
    this.setData({
      desc: e.detail
    })
  },

  //绑定ingredients里的数据到ingredients中
  bindIngredients(e) {
    console.log(e.detail)
    this.setData({
      ingredients: e.detail
    })
  },

  //绑定burden里的数据到burden中
  bindBurden(e) {
    console.log(e.detail)
    this.setData({
      burden: e.detail
    })
  },

  //菜品类别
  onClickNav({ detail = {} }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    });
  },
  //菜品类别
  onClickItem({ detail = {} }) {
    const { activeId } = this.data;

    const index = activeId.indexOf(detail.id);
    if (index > -1) {
      activeId.splice(index, 1);
    } else {
      activeId.push(detail.id);
    }

    this.setData({ activeId });
  },



  //绑定步骤里的数据到steps数组中
  bindText(e){
    const index = parseInt(e.currentTarget.dataset.index)
    console.log(index)
    console.log(e.detail)
    const text = "steps[" + index + "].step"
    this.setData({
      [text]: e.detail
    })
  },

  //添加步骤填入控件
  addStep(){
    var newStep = { 
      img:'',
      step:''
    }
    console.log(this.data.steps)
    this.setData({
      steps: this.data.steps.concat(newStep),
      stepNum: this.data.stepNum + 1
    })
    console.log('index', this.data.stepNum)
    console.log(this.data.steps)
    console.log('index', this.data.stepNum)
  },

  //提交菜谱信息
  submit(){
    var that = this
    this.uploadFile1()//将存在临时路径中的图片上传至云存储

    setTimeout(function () {
      that.uploadFile2() // 将存在临时路径中的图片上传至云存储
    }, 1000) //延迟时间 这里是1秒

    setTimeout(function () {
      that.addFoods() 
    }, 3000)

    setTimeout(function () {
      that.goDetail() 
    }, 4000)
  },


  //将存在临时路径中的图片上传至云存储
  uploadFile1(){
    //封面图片上传到云,返回云路径放在cloudImages中
    console.log('this.data.images[0]', this.data.images[0])
    wx.cloud.uploadFile({
      cloudPath: 'foodImg/' + this.data._openid + this.data.title + '封面.png',//文件名唯一命名问题
      filePath: this.data.images[0], // 文件路径
      success: res => {
        // get resource ID
        console.log('uploadFile函数res.fileID', res.fileID)
        this.setData({
          cloudImages: this.data.cloudImages.concat(res.fileID)
        })
        console.log('uploadFile函数this.data', this.data)
      },
      fail: err => {
        console.log('图片上传失败,失败原因为',err)
      }
    })
  },
  //步骤图片上传到云
  uploadFile2(){
    for (let index in this.data.stepImages) {
      //将路径转化为字符string，filePath限定string 卡了我一个下午 气死
      console.log("this.data.stepImages[index]", this.data.stepImages[index])
      var filePath1 = this.data.stepImages[index].join('')
      console.log("filePath1", filePath1)
      wx.cloud.uploadFile({
        cloudPath: 'foodImg/' + this.data._openid + this.data.title + '步骤' + index + '.png',//文件名唯一命名问题
        filePath: filePath1, // 文件路径
        success: res => {
          // get resource ID
          console.log('uploadFile函数res.fileID', res.fileID)
          console.log('index',index)
          let up = "steps[" + index + "].img"
          this.setData({
            cloudstepImages: this.data.cloudstepImages.concat(res.fileID),
            [up]: res.fileID
          })

        },
        fail: err => {
          // handle error
          console.log('失败上传图片了',err)
        }
      })
    }

    //this.addFoods()
  },

  //上传到foods表
  addFoods(){
    var that =  this
    console.log('zai kanan cloudimages', this.data)
    const db = wx.cloud.database()
    db.collection('Foods').add({
      data: {
        //_id: 'food' + that.data.openid,
        albums: this.data.cloudImages,
        //authorId:this.data.openid,
        authorName:this.data.nickName,
        burden: this.data.burden,
        category: this.data.tags,
        count:1,
        desc: this.data.desc,
        ingredients: this.data.ingredients,
        steps: this.data.steps,
        title: this.data.title,
        limit:0//0-大家都可见   1-执行删除操作后变成1，不可见
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        that.setData({
          foodId: res._id
        })
        wx.showToast({
          title: '上传菜谱成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },


  goDetail() {
    console.log('foodId', this.data.foodId)
    if (this.data.foodId) {

      //提示上传成功并跳转到详情页
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.foodId}`,
      })
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
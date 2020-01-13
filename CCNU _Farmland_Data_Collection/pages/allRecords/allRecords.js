// pages/allRecords.js
var app = getApp();
const db = wx.cloud.database();
var collectionList = []; //数据库取出的集合列表
var markersList = []; //页面显示的marker



Page({

  /**
   * 页面的初始数据
   */
  data: {
    allRecords: markersList,
    controls: [{
        id: 0,
        iconPath: "../../images/mylocation.png",
        // iconPath: "../../images/mylocation.png",
        position: {
          left: 31,
          top: 2,
          width: 30,
          height: 30
        },
        clickable: true
      },
      {
        //左3，说明按钮
        id: 2,
        iconPath: "../../images/tips.png",
        position: {
          left: 62,
          top: 2,
          width: 30,
          height: 30
        },
        clickable: true
      }
    ],
  },

  controltap(e) { //controll点击事件
    console.log(e.controlId);
    if (e.controlId == 0) { //如果ID是0，返回当前位置
      this.mapCtx.moveToLocation()
    } else if (e.controlId == 2) {
      wx.showModal({
        title: '提示！',
        content: "请到关于'我们页面'查看本软件的 使用方法 和 详细介绍。",
        showCancel: false,
        confirmText: "确定",
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //获取当前位置
    wx.getLocation({
      success: function(res) {
        console.log(res);
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
        })
      }
    });

    var that = this;
    var batchTimes = 2; //小程序一次只能读取20条数据，为了降低资源消耗。这里默认添加云数据库中前20*2 = 40条数据添加至显示。

    for (let i = 0; i < batchTimes; i++) {
      console.log(i)
      //取batchTimes次，skip表示跳到哪里开始取，默认一次取20个。
      db.collection('CCNU_Farm_Data_Collection').orderBy('Collect_date', 'desc').skip(i * 20).get({

        success: function(res) { //第一个20条记录取出后，push至列表
          for (let j = 0; j < res.data.length; j++) {
            var tempMarker = {
              longitude: res.data[j].longitude,
              latitude: res.data[j].latitude,
              width: 35,
              height: 30,
              callout: {
                content: res.data[j].Collect_date + "\n" + res.data[j].landClass + '\n' + 'lat:' + res.data[j].latitude.toFixed(4) + '/ lng:' + res.data[j].longitude.toFixed(4),
                color: "#ff0000",
                fontSize: 8,
                borderRadius: 10,
                bgColor: "#ffffff",
                padding: 2,
                display: "ALWAYS",
              }
            }

            markersList.push(tempMarker);

          }
          that.setData({
            allRecords: markersList,
          })
        }
      })
    }
    console.log('OK')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.mapCtx = wx.createMapContext('myMap'); //获取地图存入变量


  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    //下拉重新执行onLoad函数
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onLoad()
    setTimeout(() => {
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      wx.hideLoading();
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
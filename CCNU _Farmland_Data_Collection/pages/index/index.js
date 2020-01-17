// pages/map/map.js
var app = getApp();
var util = require("../../utils/util.js");
var markerId = 1;
var markersList = [];

// var landClassList = ['0.水稻','1.小麦','2.油菜','3.虾稻田','4.玉米','5.大豆'];   //多类别开启
var landClassList = ['冬油菜','冬闲田','其它'];   //类别

const db = wx.cloud.database().collection("CCNU_Farm_Data_Collection");   //数据库实例化
// var latitude = "1";
// var longitude = "1";

Page({
  /**
   * 页面的初始数据。
   */
  // hasMarkers:false,    //设置动态显示marker标志


  data: {

    controls: [
      {
        //左二，回到定位按钮
        id: 0,
          //设置controls的icaonPath时不要使用中文，不然有些机型不显示（独家发现）
        iconPath: "../../images/mylocation.png",
        position: {
          left: 31,
          top: 2,
          width: 30,
          height: 30
        },
        clickable: true
      },

      {
        //左一，提交按钮
        id: 1,
        // iconPath: "../../images/marker3-48.png",
        iconPath: "../../images/submit.png",
        position: {
          left: 0,
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
    markers: markersList, //marker标签列表
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取当前位置
    wx.getLocation({
      success: function (res) {
        console.log(res);
        that.setData({
          longitude: res.longitude,
          latitude: res.latitude,
        })

      }
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.mapCtx = wx.createMapContext('myMap');   //获取地图存入变量
  },

  onShareAppMessage: function () {

  },
  
  markerTap(e) {    //点击marker事件，再次点击标记进行删除
    var that = this;

    // console.log(e);
    // console.log(e.markerId);
    deleteMarker(e.markerId);

    function deleteMarker(mkid){
      for(var i = 0 ;i < markersList.length ; i++ ){
        if (markersList[i].id == e.markerId){
          markersList.splice(i,1)
        }
      }
      that.setData({    //this.setData是以用来改变data中的数据，它与直接赋值的区别在于可以通知界面发生变化，直接复制没有办法实现这一点（早期）
        markers: markersList,
      })
    }
  },

  

  mapTap(e){    //点击地图事件 ——> 添加marker
    var time = util.formatTime(new Date());
    var that = this;

    console.log(time)
    console.log(e);
    if(markersList.length <= 19){   //设置单次最多只能添加20条数据
      addMarker();
      markerId = markerId + 1;
    }


    console.log(markersList);
    function addMarker() {
      var tempMarker = {
        longitude: e.detail.longitude,
        latitude: e.detail.latitude,
        id: markerId,
        width: 35,
        height: 30,
        // alpha: "0",
        callout: {
          content: time + "\n"+"id:" + markerId,
          color: "#ff0000",
          fontSize: 8,
          borderRadius: 10,
          bgColor: "#ffffff",
          // bgColor: '255,255,255,0.5',
          padding: 10,
          display: "ALWAYS",
          // display:"BYCLICK",
        } 
      } ;
      markersList.push(tempMarker);
      that.setData({    //this.setData是以用来改变data中的数据，它与直接赋值的区别在于可以通知界面发生变化，直接复制没有办法实现这一点（早期）
        markers: markersList,
      })
    }
  },

  regionchange(e) { //拖动地图
    if (e.type == 'end') { //如果拖动结束，也就是松开手指
      console.log('拖动结束，下面获取地图中间的经纬度');
      this.mapCtx.getCenterLocation({   //获取屏幕中间的经纬度
        success: function (res) {
          console.log(res)
        }
      })
    }
  },

  controltap(e) {   //controll点击事件
    console.log(e.controlId);
    var that = this;

    if (e.controlId == 0) { //如果ID是0，返回当前位置
      this.mapCtx.moveToLocation()
    }else if(e.controlId == 2){
      wx.showModal({
        title: '提示！',
        content: "请到关于'我们页面'查看本软件的 使用方法 和 详细介绍。",
        showCancel: false,
        confirmText: "确定",
      })
    }else if(e.controlId == 1 && markersList.length >= 1) {
      //如果controllId为1（标记），则执行弹出层函数。

      wx.showActionSheet({
        // itemList: [ '0.水稻', '1.小麦', '2.油菜', '3.虾稻田', '4.玉米', '5.大豆'],
        itemList: ['此田块种了冬油菜','此田块为冬闲田','其它'],
        success(res) {
          console.log(res.tapIndex)
          var tapIndex = res.tapIndex;    //返回地类数组索引
          wx.showModal({
            title: '请确认',
            content: '本次一共提交 ' + markersList.length + ' 条数据,' + '类型为 [' + landClassList[tapIndex] + ']\n是否提交？',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                //循环添加记录

                for (var i = 0; i < markersList.length;i++) {
                  db.add({
                    data: {
                      latitude: markersList[i].latitude,
                      // latitude: 12,
                      longitude: markersList[i].longitude,
                      landClass: landClassList[tapIndex],
                      Collect_date: util.formatTime(new Date()),
                    },

                    success: function (res) {
                      // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                      console.log(res);
                    },
                    fail: console.error
                  })
                };

                wx.showToast({
                  title: '提交成功',
                  icon: 'success',
                  duration: 2000,

                  success: function () {
                    markersList = []
                    that.setData({
                      markers: markersList,
                    })
                  }

                  // success:function(){
                  //   that.setData({ markers :[]});
                  // }
                
                  // success:function(){
                  //   wx.redirectTo({
                  //     url: 'pages/logs/logs',
                  //   })
                  // }
                });
                


                
              } else if (res.cancel) {
                console.log('用户点击取消')
              }

            }
          })
        },

        fail(res) {
          console.log(res.errMsg)
        }
      })
    }
  },
})
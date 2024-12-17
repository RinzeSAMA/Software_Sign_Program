// pages/person/person.js
var app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    isDisabled: true, //表示页面加载完成时disabled为启用状态
    text: "修改信息", //表示按钮初始文字为编辑
    inputFrame: "",
    i: 0,
    tea_phone_number: '',
    email: '',
    teaId: '',

    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),

  },
  onLoad: function () {
    app.editTabBar1(); //显示自定义的底部导航
    const head = app.globalData.avatarUrl
    this.setData({
      head: head
    })
    const that = this; // 在回调函数之外保存对页面this的引用
    // 获得缓存的用户ID的课程
    wx.getStorage({
      key: 'teaId',
      success: function (res) {
        console.log(res.data);
        that.setData({
          teaId: res.data
        });
        console.log(that.data.teaId);
        // 获取数据库信息
        var apiUrl = 'http://127.0.0.1:5000/teacher_manager/view_signal_teacher'
        wx.request({
          url: apiUrl,
          method: 'GET',
          header: {
            'app': 'wx-app'
          },
          data: {
            'teacher_id': that.data.teaId,
          },
          success: function (res) {
            if (res.statusCode === 200) {
              // 接受参数
              var result = res.data;
              console.log(result)
              // 获取数据库长度
              var length = Object.keys(result.teacher_information).length;

              for (let i = 0; i < length; i++) {
                console.log(i)


                const tea_name = result.teacher_information.teacher_name;
                const tea_id = result.teacher_information.teacher_id;
                const email = result.teacher_information.email;
                const institute = result.teacher_information.institute;
                // const phone_number = result.teacher_information.phone_number;

                const phone_number = app.globalData.tea_phone_number

                that.setData({
                  tea_name: tea_name,
                  tea_id: tea_id,
                  email: email,
                  institute: institute,
                  phone_number: app.globalData.tea_phone_number
                })

                console.log(phone_number)

                break; // 可以选择在找到匹配数据后终止循环
              }
            }

          },
          fail: function (error) {
            // 捕捉请求报错
            console.error('Request failed:', error);
          }
        })
      }
    });


  },
  onInput: function (e) {
    // 检查是哪个输入框触发了事件
    if (e.target.id === 'phone') {
      // 修改电话
      const tea_phone_number = e.detail.value;
      app.globalData.tea_phone_number = tea_phone_number;
      this.setData({
        phone_number: tea_phone_number,
      });
    } else if (e.target.id === 'email') {
      // 修改邮箱
      const email = e.detail.value;
      app.globalData.email = email;
      this.setData({
        email: email,
      });
    }
  },
  changeState(e) {
    if (!this.data.isDisabled) { //当disabled=false时


      this.setData({
        isDisabled: true, //修改isDisabled的值为true（即启用状态）
        text: "修改信息", //文字修改为“修改信息”
        inputFrame: ""
      })
      this.update_tea_infor()

    } else { //当disabled=true时

      this.setData({
        isDisabled: false, //修改isDisabled的值为false（即禁用状态）
        text: "保存修改", //文字修改为“保存修改”
        inputFrame: "border: 1px solid #ddd",

      })
     
    }

  },
  update_tea_infor: function () {
    // //post访问数据库修改数据库参数
    //  // 获取数据库信息
    var apiUrl = 'http://localhost:5000/teacher_manager/update_signal_teacher'
    var that = this;

    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'app': 'wx-app'
      },
      data: JSON.stringify({
        'teacher_id': that.data.teaId,
        'phone_number': that.data.phone_number,
        'email': that.data.email
      }),
      success: function (res) {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '修改成功！',
          })
        } else {
          wx.showToast({
            title: '修改失败！',
            icon: 'none',
          })
        }
      },
      fail:function(err){
        console.log(err)
      }
    })
  },
  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail;
    const {
      nickName
    } = this.data.userInfo;
    app.globalData.avatarUrl = avatarUrl

    this.setData({
      head: app.globalData.avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,

    })

  }
});
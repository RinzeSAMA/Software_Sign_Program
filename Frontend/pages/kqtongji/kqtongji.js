var app = getApp()
Page({

  data: {
    tabBar: {}, // 确保你的data里有tabBar对象
    radioValue: '1', // 默认选中缺勤名单
    courseNames: ['操作系统原理', '编译原理', '软件工程', 'ELC4'],
    courseIds:['c1','c2','c3','c4'],
    WeekIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10","11","12","13","14","15","16","17","18"],
    selectedWeek: '请选择课程',
    selectedCourse: '请选择周次',
    qingjiaList: [], // 缺勤学生列表
    absenceList: [], // 请假学生列表
    course_id:'',
  },

  onLoad: function () {
    app.editTabBar1(); // 显示自定义的底部导航
    // 初始化radioValue
    this.setData({
      radioValue: '1'
    });
  },

  onCourseNameChange: function (e) {
    this.setData({
      selectedCourse: this.data.courseNames[e.detail.value],  
      course_id: this.data.courseIds[e.detail.value]
    });
  },

  onWeekIdChange: function (e) {
    this.setData({
      selectedWeek: this.data.WeekIds[e.detail.value],
    });
  },

  onRadioChange: function (e) {
    this.setData({
      radioValue: e.detail.value
    });
  },

  fetchAbsenceList: function () {
    const { selectedWeek, selectedCourse } = this.data;
    if (selectedWeek === '请选择课程' || selectedCourse === '请选择周次') {
      wx.showToast({
        title: '请选择课程和周次',
        icon: 'none'
      });
      return;
    }
    let that = this; // 保存页面对象的引用
    wx.request({
      url: 'http://localhost:5000/teacher_manager/view_absentee_list', // 接口地址
      method: 'GET',
      data: {
        course_id:this.data.course_id,//课程
        course_no:selectedWeek,//周次
      },// 请求参数
      header: {
        'app': 'wx-app' // 设置请求的header
      },
      
      success:function(res){
        if(res.statusCode==200){
          //请求成功，更新缺勤名单数据
          that.setData({
            absenceList:res.data.absent_students
          })
        }
      },
      fail: function(error) {
        // 请求失败，设置错误信息
        that.setData({
          error: '请求失败：' + error.errMsg,
          loading: false
        });
      }
    });
    //查询缺勤名单

    // wx.request({
    //   url: 'http://localhost:5000/teacher_manager/view_absentee_list', // 接口地址
    //   method: 'GET',
    //   data: params, // 请求参数
    //   header: {
    //     'app': 'wx-app' // 设置请求的header
    //   },
    //   success:function(res){
    //     if(res.statusCode==200){
    //       //请求成功，更新缺勤名单数据
    //       this.setData({
    //         absenceList:res.data.absent_students
    //       })
    //     }
    //   }
    // })
    // //查询缺勤名单  

  }
});
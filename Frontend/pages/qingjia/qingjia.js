// pages/qingjia/qingjia.js
var app = getApp()
Page({

       /**
        * 页面的初始数据
        */
       data: {
              week: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
              weekIndex: 0,
              stuId: '',
              courseData: [], // 原始从服务器获取的课程数据
              courseIds:[],
              courseNames: [], // 存储课程名称的数组
              selectedCourse: '', // 当前选中的课程名称
              selectedCourseId:'',//选中的课程id
              // 初始化页面数据
              contactInfo: '',//
              expOverview: '',//请假理由
       },
       weekchoose(e) {
              this.setData({
                     weekIndex: e.detail.value
              });
              console.log(this.data.weekIndex)
       },
       classchoose(e) {
              // 更新选中的课程名称
              this.setData({
                     selectedCourse: this.data.courseNames[e.detail.value],
                     selectedCourseId:this.data.courseIds[e.detail.value]
              });
              console.log(this.data.selectedCourse)
              console.log(this.data.selectedCourseId)
       },
       // 处理文本域输入
       handleTextAreaInput: function (e) {
              this.setData({
                     expOverview: e.detail.value // 将输入的值设置到expOverview
                     
              });
              console.log(this.data.expOverview)
       },
       /**
        * 生命周期函数--监听页面加载
        */
       onLoad: function () {
              app.editTabBar(); // 显示自定义的底部导航
              const that = this; // 在回调函数之外保存对页面this的引用
              // 获得缓存的用户ID的课程
              wx.getStorage({
                     key: 'stuId',
                     success: function (res) {
                            console.log(res.data);
                            that.setData({
                                   stuId: res.data
                            });
                            console.log(that.data.stuId);
                            that.get_stu_class(that.data.stuId);
                     }
              });
        },
       //获得课程信息
  get_stu_class(stuId) {
    var that = this; // 保存当前页面的this引用
    // 请求的接口地址
    var apiUrl = 'http://127.0.0.1:5000/student_manager/search_student_course';
    console.log(stuId)
    wx.request({
      url: apiUrl,
      method: 'GET',
      header: {
        'app': 'wx-app'
      },
      data: {
        'student_id': stuId,
      },
      success: function (res) {
        if (res.statusCode === 200) {
          // 接受参数
          var result = res.data;
         // 提取课程ID和课程名称
         var studentCourses = result.student_courses;
         var CourseIds = [];
         var CourseNames = [];
         studentCourses.forEach(function(course) {
           for (let key in course) {
             CourseIds.push(key);
             CourseNames.push(course[key]);
           }
         });
         // 将courseId和courseNames数组赋值给页面数据
          that.setData({
            courseIds:CourseIds,
            courseNames:CourseNames,
          });
          console.log(that.data.courseIds)
          console.log(that.data.courseNames)
        } else {
          // 捕捉状态报错
          console.error('Error:', res.statusCode, res.data);
        }
      },
      fail: function (error) {
        // 捕捉请求报错
        console.error('Request failed:', error);
      }
    });
  },

       // 提交表单时调用的函数
       submitForm: function (e) {
              var apiUrl = 'http://127.0.0.1:5000/student_manager/absence_on_leave';
              // 构造请求数据
              const requestData = {
                    'student_id': this.data.stuId,
                    'course_id': this.data.selectedCourseId,
                    'week_id': parseInt(this.data.weekIndex)+3,
                    'reason':this.data.expOverview
              };


              // 发送请求
              wx.request({
                     url: apiUrl,
                     method: 'POST',
                     header: {
                            'app': 'wx-app',
                            'Content-Type': 'application/x-www-form-urlencoded'
                     },
                     data: requestData,
                     success: function (res) {
                            switch (res.statusCode) {
                                   case 200:
                                          wx.showToast({
                                                 title: '提交成功',
                                                 icon: 'success',
                                                 duration: 2000
                                          });
                                          break;
                                   case 410:
                                          wx.showToast({
                                                 title: '课程号输入错误',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                                   case 412:
                                          wx.showToast({
                                                 title: '课次输入有误',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                                   case 420:
                                          wx.showToast({
                                                 title: '重复申请',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                                   case 400:
                                          wx.showToast({
                                                 title: '请求头错误',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                                   case 500:
                                          wx.showToast({
                                                 title: '非法请求',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                                   default:
                                          wx.showToast({
                                                 title: '未知错误',
                                                 icon: 'none',
                                                 duration: 2000
                                          });
                                          break;
                            }
                     },
                     fail: function (error) {
                            wx.showToast({
                                   title: '请求失败',
                                   icon: 'none',
                                   duration: 2000
                            });
                     }
              });
       },
       /**
        * 生命周期函数--监听页面初次渲染完成
        */
       onReady() {

       },

       /**
        * 生命周期函数--监听页面显示
        */
       onShow() {

       },

       /**
        * 生命周期函数--监听页面隐藏
        */
       onHide() {

       },

       /**
        * 生命周期函数--监听页面卸载
        */
       onUnload() {

       },

       /**
        * 页面相关事件处理函数--监听用户下拉动作
        */
       onPullDownRefresh() {

       },

       /**
        * 页面上拉触底事件的处理函数
        */
       onReachBottom() {

       },

       /**
        * 用户点击右上角分享
        */
       onShareAppMessage() {

       }
})
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stuID: '',
    qiandaotime: '',
    qiandaocode: '',
    selectedCourse: '请选择课程',
    course_id:'',//要传递的课程id
    courseIds:[],//课程id列表
    courseNames: [],//课程名列表
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
  onCourseNameChange: function (e) {
    this.setData({
      selectedCourse: this.data.courseNames[e.detail.value], 
      course_id:this.data.courseIds[e.detail.value]
    });
    console.log(this.data.course_id)
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
  // 更新学生ID
  updatecode: function (e) {
    this.setData({
      qiandaocode: e.detail.value
    });
    console.log(this.data.qiandaocode)
  },

  // 签到函数
  qiandao: function () {
    // 获取当前时间
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();

    // 添加前导零
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    // 格式化时间
    var timeStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;

    // 设置签到时间
    this.setData({
      qiandaotime: timeStr
    });
    console.log(this.data.qiandaotime)
    var apiUrl = 'http://127.0.0.1:5000/student_manager/punch_in';
    var that = this;
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'app': 'wx-app',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        'student_id': that.data.stuId,
        'punch_in_time': that.data.qiandaotime,
        'code': that.data.qiandaocode,
        'course_id':that.data.course_id
      },
      success: function (res) {
        switch (res.statusCode) {
          case 200:
            wx.showToast({
              title: '签到成功',
              icon: 'success',
              duration: 2000
            });
            break;
          case 201:
            wx.showToast({
              title: '你已错过签到时间',
              icon: 'none',
              duration: 2000
            });
            break;
          case 502:
            wx.showToast({
              title: '服务器未开启',
              icon: 'none',
              duration: 2000
            });
            break;
          case 500:
            wx.showToast({
              title: '你已错过签到时间',
              icon: 'none',
              duration: 2000
            });
            break;
          case 404:
            wx.showToast({
              title: '签到码错误,或考勤不存在',
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
        console.error('Request failed:', error);
      }
    });
  },

 

  // 其他生命周期函数...

});
var app = getApp();

Page({
  data: {
    courseName: '',
    courseCode: '',
    courseWeek: '',
    signInCode: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    teaId: '',
    courseIds: [],
    courseNames: [],
    WeekIds: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
  },

  onLoad: function () {
    app.editTabBar1(); //显示自定义的底部导航
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
        that.get_tea_class(that.data.teaId);
      }
    });
  },
  get_tea_class:function(teaId){
    var that = this; // 保存当前页面的this引用
    // 请求的接口地址
    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/search_teacher_course';
    console.log(teaId)
    wx.request({
      url: apiUrl,
      method: 'GET',
      header: {
        'app': 'wx-app'
      },
      data: {
        'teacher_id': teaId,
      },
      success: function (res) {
        if (res.statusCode === 200) {
          // 接受参数
          var result = res.data;
         // 提取课程ID和课程名称
         var teacherCourses = result.teacher_courses;
         var CourseIds = [];
         var CourseNames = [];
         teacherCourses.forEach(function(course) {
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
  inputCourseName: function (e) {
    this.setData({
      courseName: this.data.courseNames[e.detail.value],
      courseCode: this.data.courseIds[e.detail.value]
    });
    console.log(this.data.courseName)
    console.log(this.data.courseCode)
  },

  inputCourseCode: function (e) {
    this.setData({
      courseCode: e.detail.value
    });
  },

  inputCourseWeek: function (e) {
    this.setData({
      courseWeek: parseInt(this.data.WeekIds[e.detail.value])
    });
    console.log(this.data.courseWeek)
  },

  inputSignInCode: function (e) {
    this.setData({
      signInCode: e.detail.value
    });
    console.log(this.data.signInCode)
  },

  selectStartDate: function (e) {
    this.setData({
      startDate: e.detail.value
    });
    console.log(this.data.startDate)
  },
  selectEndDate: function (e) {
    this.setData({
      endDate: e.detail.value
    });
    console.log(this.data.endDate)
  },
  selectStartTime: function (e) {
    this.setData({
      startTime: e.detail.value
    });
    console.log(this.data.startTime)
  },
  selectEndTime: function (e) {
    this.setData({
      endTime: e.detail.value
    });
    console.log(this.data.endTime)
  },

  submitAttendance: function () {
    console.log('课程名称：', this.data.courseName);
    console.log('课程号：', this.data.courseCode);
    console.log('课程周次：', this.data.courseWeek);
    console.log('签到码：', this.data.signInCode);
    console.log('考勤开始日期：', this.data.startDate);
    console.log('考勤结束日期：', this.data.endDate);
    console.log('考勤开始时间：', this.data.startTime);
    console.log('考勤结束时间：', this.data.endTime);

    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/post_attendance';
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'app': 'wx-app',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        course_name: this.data.courseName,
        course_id: this.data.courseCode,
        course_no: parseInt(this.data.courseWeek),
        attendance_start_time: this.data.startDate+' '+this.data.startTime,
        attendance_end_time: this.data.endDate+' '+this.data.endTime,
        code: this.data.signInCode
      },
      success: function (res) {
        console.log('考勤发布成功', res);
        wx.showToast({
          title: '发布考勤成功',
        })
        // 处理成功响应的逻辑
      },
      fail: function (error) {
        console.log('考勤发布失败', error);
        wx.showToast({
          title: '发布考勤失败',
        })
        // 处理失败响应的逻辑
      }
    });
  }
});
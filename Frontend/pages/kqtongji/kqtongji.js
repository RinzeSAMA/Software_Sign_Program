var app = getApp()
Page({

  data: {
    tabBar: {}, // 确保你的data里有tabBar对象
    radioValue: '1', // 默认选中缺勤名单
    courseNames: [],
    courseIds: [],
    WeekIds: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"],
    selectedWeek: '请选择周次',
    selectedCourse: '请选择课程',
    qingjiaList: [], // 请假学生列表
    absenceList: [], // 缺勤学生列表
    course_id: '',
  },

  onLoad: function () {
    app.editTabBar1(); // 显示自定义的底部导航
    // 初始化radioValue
    this.setData({
      radioValue: '1'
    });
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
  get_tea_class: function (teaId) {
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
          teacherCourses.forEach(function (course) {
            for (let key in course) {
              CourseIds.push(key);
              CourseNames.push(course[key]);
            }
          });
          // 将courseId和courseNames数组赋值给页面数据
          that.setData({
            courseIds: CourseIds,
            courseNames: CourseNames,
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
    const {
      selectedWeek,
      selectedCourse
    } = this.data;
    if (selectedWeek === '请选择周次' || selectedCourse === '请选择课程') {
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
        course_id: this.data.course_id, //课程
        course_no: selectedWeek, //周次
      }, // 请求参数
      header: {
        'app': 'wx-app' // 设置请求的header
      },

      success: function (res) {
        if (res.statusCode == 200) {
          //请求成功，更新缺勤名单数据
          // 请求成功，更新缺勤名单数据
          let qingjiaList = []; // 请假列表
          let absenceList = []; // 缺勤列表

          // 遍历缺勤学生名单，根据status分类
          res.data.absent_students.forEach(student => {
            if (student.status === 0) {
              // 如果status为0，存入absenceList
              absenceList.push(student);
            } else if (student.status === 2 || student.status === 3) {
              // 如果status为2或3，存入qingjiaList
              qingjiaList.push(student);
            }
          });
          // 更新页面数据
          that.setData({
            qingjiaList: qingjiaList,
            absenceList: absenceList
          });
        } else {
          // 处理非200的响应状态码
          that.setData({
            error: '服务器响应错误：' + res.errMsg,
            loading: false
          });
        }
      },
      fail: function (error) {
        // 请求失败，设置错误信息
        that.setData({
          error: '请求失败：' + error.errMsg,
          loading: false
        });
      }
    });
  }
});
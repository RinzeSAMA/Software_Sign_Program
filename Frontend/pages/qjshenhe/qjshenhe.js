var app = getApp()
Page({
  data: {
    leaveApplications: [],
    teaId: '',
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
        that.getLeaveApplications();
      },
    });
  },

  getLeaveApplications: function () {
    var that = this;
    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/get_leave_requests';
    wx.request({
      url: apiUrl,
      header: {
        'app': 'wx-app'
      },
      data: {
        'teacher_id': that.data.teaId,
      },
      method: 'GET',
      success: function (res) {
        that.setData({
          leaveApplications: res.data.leave_requests
        });
        console.log('获取请假申请列表成功', that.data.leaveApplications);
      },
      fail: function (err) {
        console.error('获取请假申请列表失败', err);
      }
    });
  },

  approveLeave: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var application = this.data.leaveApplications[index];
    var student_id = application.student_id;
    var course_id = application.course_id;
    var course_no = application.course_no;
    console.log('通过请假申请：', this.data.leaveApplications[index]);
    console.log('通过请假申请：', student_id);
    console.log('通过请假申请：', course_id);
    console.log('通过请假申请：', course_no);
    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/review_leave_request';
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'app': 'wx-app',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        'student_id': student_id,
        'course_id': course_id,
        'course_no': course_no,
        'is_reviewed': true
      },
      success: function (res) {
        console.log('通过申请成功', res);
        wx.showToast({
          title: '通过申请成功',
          icon: 'none'
        });
        that.getLeaveApplications();
      },
      fail: function (err) {
        console.error('通过申请失败', err);
        wx.showToast({
          title: '通过申请失败',
          icon: 'none'
        });
      }
    });
  },

  rejectLeave: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var application = this.data.leaveApplications[index];
    var student_id = application.student_id;
    var course_id = application.course_id;
    var course_no = application.course_no;

    console.log('拒绝请假申请：', this.data.leaveApplications[index]);
    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/review_leave_request';
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'app': 'wx-app',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        'student_id': student_id,
        'course_id': course_id,
        'course_no': course_no,
        'is_reviewed': false
      },
      success: function (res) {
        console.log('拒绝申请成功', res);
        wx.showToast({
          title: '拒绝申请成功',
          icon: 'none'
        });
        that.getLeaveApplications();
      },
      fail: function (err) {
        console.error('拒绝申请失败', err);
        wx.showToast({
          title: '拒绝申请失败',
          icon: 'none'
        });
      }
    });
  },
});
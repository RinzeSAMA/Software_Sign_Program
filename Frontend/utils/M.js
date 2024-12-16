import {
  Cd
} from './B.js';
class M extends Cd {
  constructor() {
    super();
  }
  /**
   * 登录模块网络请求
   * */
  student_signup(code, password) {
    // 请求的接口地址
    console.log(code, password)
    var apiUrl = 'http://127.0.0.1:5000/student_manager/verify_stu_login';
    wx.request({
      url: apiUrl,
      method: 'GET',
      header: {
        'app': 'wx-app'
      },
      data: {
        'student_id': code,
        'student_password': password
      },
      success: function (res) {
        if (res.statusCode === 200) {
          // 接受参数
          var result = res.data;
          setTimeout(() => {
            // 将用户ID存入缓存，使用同步方法wx.setStorageSync
            try {
              wx.setStorageSync('stuId', code);
              console.log('用户ID存储成功');
            } catch (e) {
              console.error('用户ID存储失败', e);
            }
            // 展示“登录成功！”提示
            wx.showToast({
              title: '登录成功！',

              duration: 1500, // 展示1.5秒
              complete: () => {
                // 1.5秒后执行跳转
                setTimeout(() => {
                  wx.redirectTo({
                    url: '../qiandao/qiandao'
                  });
                  wx.hideLoading();
                }, 1500); // 确保提示展示1.5秒后再跳转
              }
            });
          }, 1500);
        } else if (res.statusCode === 404) {
          // 捕捉状态报错
          wx.hideLoading();
          wx.showToast({
            title: '学号或密码错误',
            icon:'none',
          })
        }
      },
      fail: function (error) {
        // 捕捉请求报错
        console.error('Request failed:', error);
      }
    });
  }
  teacher_signup(id, password) {
    // 请求的接口地址
    var apiUrl = 'http://127.0.0.1:5000/teacher_manager/verify_teacher_login';
    wx.request({
      url: apiUrl,
      method: 'GET',
      header: {
        'app': 'wx-app'
      },
      data: {
        'teacher_id': id,
        'teacher_password': password
      },
      success: function (res) {
        if (res.statusCode === 200) {
          var result = res.data;
          setTimeout(() => {
            // 将用户ID存入缓存，使用同步方法wx.setStorageSync
            try {
              wx.setStorageSync('teaId', id);
              console.log('用户ID存储成功');
            } catch (e) {
              console.error('用户ID存储失败', e);
            }
             // 展示“登录成功！”提示
            wx.showToast({
              title: '登录成功！',
              duration: 1500, // 展示1.5秒
              complete: () => {
                // 1.5秒后执行跳转
                setTimeout(() => {
                  wx.redirectTo({
                    url: '../kqtongji/kqtongji'
                  });
                  wx.hideLoading();
                }, 1500); // 确保提示展示1.5秒后再跳转
              }
            });
          }, 1500);
        } else {
          // 捕捉状态报错
          wx.hideLoading();
          wx.showToast({
            title: '学号或密码错误',
            icon:'none',
          })
        }
      },
      fail: function (error) {
        // 捕捉请求报错
        console.error('Request failed:', error);
      }
    });
  }
  sLogin(datas) {
    let parameter = {
      url: '/student_manager/verify_stu_login',
      type: 'GET',
      data: datas
    }
    return this.ajax('encode', parameter);
  }
  tLogin(datas) {
    let parameter = {
      url: '/public/admin/manager/ajaxLoginManager',
      type: 'POST',
      data: datas
    }
    return this.ajax('encode', parameter);
  }
  signIn(datas) {
    let parameter = {
      url: '/public/admin/students/ajaxSaveStatistics',
      type: 'POST',
      data: datas
    }
    return this.ajax('encode', parameter);
  }

  getSignStatu(datas) {
    let parameter = {
      url: '/public/admin/students/ajaxGetStatus',
      type: 'POST',
      data: datas
    }
    return this.ajax('encode', parameter);
  }

}
export {
  M
}
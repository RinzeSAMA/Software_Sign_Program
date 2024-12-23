"""
老师 Api服务
"""
from datetime import timedelta, datetime
import sys
import os

from flask import jsonify, request, Flask, json
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from models.attendence_information_table import AttendanceManager
from models.course_selection_table import CourseSelectionManager
from models.post_attendance_table import PostAttendanceManager, PostAttendanceRecord
from models.student_information_table import StudentManager
from routes import teacher_routes
from models.teacher_information_table import TeacherManager

CORS(teacher_routes)



# 验证request请求的header是否合法
def validate_request_headers():
    required_header_value = 'wx-app'

    # 检查请求头中的应用标识
    if 'app' not in request.headers or request.headers['app'] != required_header_value:
        return False

    return True

# 验证老师登录信息
@teacher_routes.route('/teacher_manager/verify_teacher_login', methods=['GET'])
def verify_teacher_login():
    # 创建teacherManager的实例
    teacher_manager = TeacherManager(table_name='teacher_information')

    # 验证请求头
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数
        teach_id = request.args.get('teacher_id')
        teach_password = request.args.get('teacher_password')

        # 查询老师的密码
        teacher_password_tuple = teacher_manager.execute_sql_query(
            f"select password from teacher_information where teacher_id='{teach_id}'")

        # 从元组中提取老师姓名
        teacher_password = teacher_password_tuple[0][0]
        if not teacher_password:
            return jsonify({'error': 'Teacher not found'}), 404

        # 返回老师名字比较的结果
        flag = teach_password == teacher_password
        if flag==True:
            return jsonify({'msg': str(flag)}),200
        else:
            return jsonify({'error': 'Teacher not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 老师查看特定课程特定周次的缺勤名单
@teacher_routes.route('/teacher_manager/view_absentee_list', methods=['GET'])
def view_absentee_list():
    # 创建查询管理器实例
    course_selection_manager = CourseSelectionManager(table_name='course_selection')
    attendance_manager = AttendanceManager(table_name='attendence_information')
    # 验证请求头部
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数：课程号和周次
        course_id = request.args.get('course_id')
        course_no = request.args.get('course_no')

        # 查询选定课程的所有学生
        sql_query_students = f"select student_id,stu_name from course_selection,student_information where course_id = '{course_id}' and course_selection.student_id = student_information.stu_id"
        student_ids = course_selection_manager.execute_sql_query(sql_query_students)


        # 存储缺勤学生的信息
        absent_students = []


        # 检查每个学生在指定周次的出勤情况
        for student_id_tuple in student_ids:
            student_id = student_id_tuple[0]
            sql_query_absence = f"SELECT * FROM attendance_information WHERE stu_id = '{student_id}' AND course_id = '{course_id}' AND course_no = {course_no}"
            absence_info = attendance_manager.execute_sql_query(sql_query_absence)

            # 如果学生在该周次有缺勤记录，则添加到列表中
            if len(absence_info) != 0:
                for info in absence_info:
                    absent_students.append({
                        'name':student_id_tuple[1],#加入名字
                        'status':info[5],#加入status
                        'reason':info[8]
                    })

        # 返回缺勤学生名单
        return jsonify({'absent_students': absent_students}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 老师发布考勤
@teacher_routes.route('/teacher_manager/post_attendance', methods=['POST'])
def post_attendance():
    # 创建查询管理器实例
    post_attendance_manager = PostAttendanceManager(table_name='post_attendance_information')

    # 验证请求头部
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数：课程号和周次
        course_name = request.form.get('course_name')
        course_id = request.form.get('course_id')
        course_no = request.form.get('course_no')
        attendance_start_time = request.form.get('attendance_start_time')
        attendance_end_time = request.form.get('attendance_end_time')
        code = request.form.get('code')

        max_index = post_attendance_manager.get_max_index()  # 获取最大索引号
        new_index = max_index + 1  # 新记录的索引号

        # 创建post_attendance记录
        post_attendance_record = PostAttendanceRecord(
            attendance_id=new_index,
            course_id=course_id,
            course_name=course_name,
            course_no=course_no,
            attendance_start_time=attendance_start_time,
            attendance_end_time=attendance_end_time,
            code=code
        )

        if post_attendance_manager.post_attendance(post_attendance_record):
            # 返回缺勤学生名单
            return jsonify({'msg':'发布考勤成功'}), 200
        else:
            return jsonify({'msg':'签到码重复了'}), 429


    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 查看某个老师的信息
@teacher_routes.route('/teacher_manager/view_signal_teacher', methods=['GET'])
def view_signal_teacher():
    teacher_manager = TeacherManager(table_name='teacher_information')

    # 验证请求头
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数
        teacher_id = request.args.get('teacher_id')

        # 查看对应老师的信息
        signal_teacher = teacher_manager.search_teacher(teacher_id)

        # 获取没有密码的信息
        info_without_password = {
            "teacher_id": signal_teacher.teacher_id,
            "teacher_name": signal_teacher.teacher_name,
            "sex": signal_teacher.sex,
            "age": signal_teacher.age,
            "institute": signal_teacher.institute,
            "major": signal_teacher.major,
            "office": signal_teacher.office,
            "home": signal_teacher.home,
            "phone_number": signal_teacher.phone_number,
            "email": signal_teacher.email,
        }

        # 返回JSON格式的学生信息
        return jsonify({'teacher_information': info_without_password})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 修改某个老师的信息
@teacher_routes.route('/teacher_manager/update_signal_teacher', methods=['POST'])
def update_signal_teacher():
    teacher_manager = TeacherManager(table_name='teacher_information')

    # 验证请求头
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数
        data = request.get_json()
        teacher_id = data.get('teacher_id')
        phone_number = data.get('phone_number')
        email = data.get('email')

        # 更新老师信息
        teacher_manager.modify_teacher(teacher_id, phone_number, email)

        # 返回成功信息
        return jsonify({'success': 'Teacher updated successfully'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 老师获取学生请假审批信息
@teacher_routes.route('/teacher_manager/get_leave_requests', methods=['GET'])
def get_leave_requests():
    # 创建AttendanceManager和TeacherManager实例
    attendance_manager = AttendanceManager(table_name='attendance_information')
    student_manager = StudentManager(table_name='student_information')

    # 验证请求头
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数：老师工号
        teacher_id = request.args.get('teacher_id')

        # 查询状态为2且与老师工号对应的记录
        sql_query_leave_requests = (f"SELECT attendance_information.stu_id, attendance_information.course_id, course_no, date,reason,course_name"
                                    f" FROM attendance_information,course"
                                    f" WHERE status = 2 AND attendance_information.teacher_id = '{teacher_id}'"
                                    f"AND attendance_information.course_id = course.course_id"
                                    )
        leave_requests = attendance_manager.execute_sql_query(sql_query_leave_requests)

        #根据course_id查询对应的
        # 存储学生请假信息
        leave_requests_info = []

        # 对每个请假记录，查询学生姓名
        for leave_request_item in leave_requests:
            leave_request_detail = {
                "student_id": leave_request_item[0],
                "course_id": leave_request_item[1],
                "course_no": leave_request_item[2],
                "date": leave_request_item[3],
                "reason": leave_request_item[4],
                "course_name": leave_request_item[5]
            }

            student_information = student_manager.search_student(leave_request_detail['student_id'])
            leave_request_detail["student_name"] = student_information.stu_name

            leave_requests_info.append(leave_request_detail)

        # 返回学生请假信息
        return jsonify({'leave_requests': leave_requests_info})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 查询老师所教的课程
@teacher_routes.route('/teacher_manager/search_teacher_course', methods=['GET'])    # 请求创建请假数据
def search_teacher_course():
    # 创建CourseSelectionManager的实例
    course_selection_manager = CourseSelectionManager(table_name='course')
    # 验证请求头
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取参数请求
        teacher_id = request.args.get('teacher_id')

        # 查询数据库
        sql_command = f"select distinct course_id,course_name from course_selection where teacher_id = '{teacher_id}'"
        all_courses = course_selection_manager.execute_sql_query(sql_query=sql_command)

        # 展开课程名称
        courses_list = [
            {
                 course.course_id: course.course_name
            }
            for course in all_courses
        ]

        # 返回JSON格式的所选课程
        return jsonify({'teacher_courses': courses_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

#请假审批
@teacher_routes.route('/teacher_manager/review_leave_request', methods=['POST'])
def review_leave_request():
    # 创建查询管理器实例
    attendance_manager = AttendanceManager(table_name='attendance_information')

    # 验证请求头部
    if not validate_request_headers():
        return jsonify({'error': 'Invalid application identification'}), 400

    try:
        # 获取请求参数：课程号和周次
        student_id = request.form.get('student_id')
        course_id = request.form.get('course_id')
        course_no = request.form.get('course_no')
        is_reviewed = request.form.get('is_reviewed')

        # 初始化审核状态，若通过审核则为3，否则为4
        status = 3 if is_reviewed == 'true' else 4
        # 更新的sql语句
        update_sql_statement = (
            f"UPDATE attendance_information SET status = {status} "
            f"WHERE stu_id = '{student_id}' AND course_id = '{course_id}' AND course_no = {course_no}"
        )

        # 执行更新操作
        rows_affected = attendance_manager.execute_sql_query(update_sql_statement)

        if rows_affected > 0:
            return jsonify({'msg': 'Leave request reviewed successfully'}), 200
        else:
            return jsonify({'error': 'Failed to review leave request'}), 401

    except Exception as e:
        return jsonify({'error': str(e), 'status': 500}), 500

if __name__ == "__main__":
    # 创建测试单元的Flask 应用程序
    app = Flask(__name__)

    #  1. 测试 verify_stu_login 函数
    # print("\nTesting verify_stu_login:")
    # 提供一些测试参数
    # test_teacher_id_login = 'T001'
    # test_teacger_name_login = '张老师'
    # # 构造一个测试请求对象
    # test_request_verify_login = {
    #     'headers': {'app': 'wx-app'},
    #     'args': {'teacher_id': test_teacher_id_login, 'teacher_name': test_teacger_name_login}  # 使用 args
    # }
    # # 将 args 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_request_verify_login['headers'],
    #                               query_string=test_request_verify_login['args']):  # 使用 query_string 来传递查询参数
    #     response_verify_login = verify_teacher_login()
    #     print(response_verify_login)


    # 2. 测试 view_absentee_list 函数
    # print("\nTesting view_absentee_list:")
    # # 提供一些测试参数
    # test_course_id = 'c1'
    # test_course_no = 2
    # # 构造一个测试请求对象
    # test_view_absentee_list = {
    #     'headers': {'app': 'wx-app'},
    #     'args': {'course_id': test_course_id, 'course_no': test_course_no}  # 使用 args
    # }
    # # 将 args 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_view_absentee_list['headers'],
    #                               query_string=test_view_absentee_list['args']):  # 使用 query_string 来传递查询参数
    #     response_view_absentee_list = view_absentee_list()


    #3. 测试 post_attendance 函数
    # print("\nTesting post_attendance:")
    #
    # one_day = timedelta(days=1)
    #
    # # 提供一些测试参数
    # test_course_name = '操作系统原理'
    # test_course_id = 'c1'
    # test_course_no = 17
    # test_attendance_start_time = datetime.now()
    # test_attendance_end_time = datetime.now() + one_day
    # test_code = 'c0002'
    #
    # # 构造一个测试请求对象
    # test_post_attendance = {
    #     'headers': {'app': 'wx-app', 'Content-Type': 'application/x-www-form-urlencoded'},
    #     'data': {'course_name': test_course_name, 'course_id': test_course_id, 'course_no':test_course_no,
    #              'attendance_start_time': test_attendance_start_time, 'attendance_end_time':test_attendance_end_time,
    #              'code':test_code}  # 使用 data 来传递 form data
    # }
    # # 将 data 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_post_attendance['headers'],
    #                               data=test_post_attendance['data']): # 使用 data 来传递 form data
    #     response_post_attendance = post_attendance()


    # 4. 测试 view_signal_teacher 函数
    # print("\nTesting view_signal_teacher:")
    # # 提供一些测试参数
    # test_teacher_id = 'T001'
    # # 构造一个测试请求对象
    # test_request_view_signal_teacher = {
    #     'headers': {'app': 'wx-app'},
    #     'args': {'teacher_id': test_teacher_id}  # 使用 args
    # }
    # # 将 args 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_request_view_signal_teacher['headers'],
    #                               query_string=test_request_view_signal_teacher['args']):  # 使用 query_string 来传递查询参数
    #     response_view_signal_teacher = view_signal_teacher()
    #     print(response_view_signal_teacher)


    #  5. 测试 get_leave_requests 函数
    # print("\nTesting get_leave_requests:")
    # # 提供一些测试参数
    # test_teacher_id = 'T001'
    #
    # # 构造一个测试请求对象
    # test_request_get_leave_requests = {
    #     'headers': {'app': 'wx-app'},
    #     'args': {'teacher_id': test_teacher_id}  # 使用 args
    # }
    # # 将 args 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_request_get_leave_requests['headers'],
    #                               query_string=test_request_get_leave_requests['args']):  # 使用 query_string 来传递查询参数
    #     response_get_leave_requests = get_leave_requests()
    #     # 在测试 get_leave_requests 函数后，打印响应内容
    #     print(json.loads(response_get_leave_requests.get_data(as_text=True)))


    # 6. 测试 search_teacher_course 函数
    # print("\nTesting search_teacher_course:")
    # # 提供一些测试参数
    # test_teacher_id = 'T001'
    # # 构造一个测试请求对象
    # test_request_search_teacher_course = {
    #     'headers': {'app': 'wx-app'},
    #     'args': {'student_id': test_teacher_id}  # 使用 args
    # }
    # # 将args作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_request_search_teacher_course['headers'],
    #                               query_string=test_request_search_teacher_course['args']):  # 使用query_string来传递查询参数
    #     response_search_teacher_course = search_teacher_course()
    #     print(response_search_teacher_course)
    #     print(response_search_teacher_course[0].json)  # 输出返回值的内容

    # 7. 测试 review_leave_request 函数
    # print("\nTesting review_leave_request:")
    #
    # # 提供一些测试参数
    # test_student_id = '2021611011'
    # test_course_id = 'c1'
    # test_course_no = 14
    # test_is_reviewed = 'false'  # Assuming is_reviewed should be a boolean value
    #
    # # 构造一个测试请求对象
    # test_leave_request = {
    #     'headers': {'app': 'wx-app', 'Content-Type': 'application/x-www-form-urlencoded'},
    #     'data': {'student_id': test_student_id, 'course_id': test_course_id, 'course_no': test_course_no,
    #              'is_reviewed': test_is_reviewed}  # 使用 data 来传递
    # }
    #
    # # 将 form 作为构造请求上下文的一部分
    # with app.test_request_context(path='/', base_url='http://localhost',
    #                               headers=test_leave_request['headers'],
    #                               data=test_leave_request['data']):  # 使用 data 来传递
    #     response_review_leave_request = review_leave_request()
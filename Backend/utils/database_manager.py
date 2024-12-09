"""
连接MySQL数据库
"""
from sqlalchemy import create_engine

class DatabaseManager:
    def __init__(self, table_name, db_user='root', db_password='root', db_host='127.0.0.1', db_port=3306, db_name='student_sign_db', ):
        self.db_user = db_user
        self.db_password = db_password
        self.db_host = db_host
        self.db_port = db_port
        self.db_name = db_name
        self.table_name = table_name
        self.engine = create_engine(self._get_connection_string())
        self.df = None

    def _get_connection_string(self):
        return f'mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}'
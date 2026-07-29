import os
from pyspark.sql import SparkSession

# Set HADOOP_HOME on Windows if winutils is installed
if os.name == "nt" and "HADOOP_HOME" not in os.environ:
    winutils_dir = os.environ.get("WINUTILS_DIR", r"C:\winutils")
    if os.path.exists(winutils_dir):
        os.environ["HADOOP_HOME"] = winutils_dir
        os.environ["PATH"] += os.pathsep + os.path.join(winutils_dir, "bin")


class DbConnection:

    def __init__(self):
        # Store database configurations with env variables and fallback defaults
        db_host = os.environ.get("DB_HOST", "localhost")
        db_port = os.environ.get("DB_PORT", "3306")
        db_name = os.environ.get("DB_NAME", "buildpro_db")

        self.mysql_url = f"jdbc:mysql://{db_host}:{db_port}/{db_name}"
        self.db_properties = {
            "user": os.environ.get("DB_USERNAME", "root"),
            "password": os.environ.get("DB_PASSWORD", "Mohan123"),
            "driver": "com.mysql.cj.jdbc.Driver"
        }

    def get_spark_session(self):
        """Creates and returns the Spark Session."""
        jar_path = os.environ.get("MYSQL_JAR_PATH", r"C:\winutils\mysql-connector-j-8.3.0.jar")

        builder = SparkSession.builder \
            .appName("PySpark-MySQL-Integration") \
            .config("spark.driver.host", "127.0.0.1") \
            .config("spark.driver.bindAddress", "127.0.0.1")

        if os.path.exists(jar_path):
            builder = builder.config("spark.driver.extraClassPath", jar_path)
        else:
            builder = builder.config("spark.jars.packages", "com.mysql:mysql-connector-j:8.3.0")

        return builder.getOrCreate()

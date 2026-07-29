import os
import sys
from datetime import datetime

# Resolve parent directory in sys.path for direct script execution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from entities.products import Products
from entities.users import Users
from entities.cart import Cart
from entities.otps import Otps
from entities.categories import Categories
from entities.sessions import Sessions
from entities.cart_items import CartItems

import pyspark.sql.functions as F
from pyspark.sql.functions import col, desc, row_number, current_timestamp as spark_current_timestamp
from pyspark.sql.window import Window


class UserActivity:
    """PySpark Analytics pipeline for user activity tracking."""

    def __init__(self):
        users = Users()
        self.user_df = users.create_user_model()
        self.active_users = self.user_df

        products = Products()
        self.product_df = products.create_product_model()

        cart = Cart()
        self.cart_df = cart.create_cart_model()

        otps = Otps()
        self.otps_df = otps.create_otps_model()

        categories = Categories()
        self.categories_df = categories.create_categories_model()

        sessions = Sessions()
        self.sessions_df = sessions.create_sessions_model()

        cart_items = CartItems()
        self.cart_items_df = cart_items.create_cart_items_model()

    def show_user_df(self):
        self.user_df.show()

    def show_product_df(self):
        self.product_df.show()

    def show_cart_df(self):
        self.cart_df.show()

    def show_otps_df(self):
        self.otps_df.show()

    def show_categories_df(self):
        self.categories_df.show()

    def show_sessions_df(self):
        self.sessions_df.show()
        
    def show_cart_items_df(self):
        self.cart_items_df.show()

    # Convenience accessors
    def get_user_df(self):
        return self.user_df

    def get_product_df(self):
        return self.product_df

    def get_cart_df(self):
        return self.cart_df

    def get_otps_df(self):
        return self.otps_df

    def get_categories_df(self):
        return self.categories_df

    def get_sessions_df(self):
        return self.sessions_df
    def get_cart_items_df(self):
        return self.cart_items_df

    def get_preference_Category_df(self):

        """Optimized Pipeline: Finds each active user's most added category with minimal network shuffle."""
        # 1. Early Column Selection & Active Session Filtering
        active_user_ids = self.sessions_df.filter(col("expiry_date") > spark_current_timestamp()) \
                                          .select("user_id").distinct()

        # 2. Select minimal required integer columns
        carts = self.cart_df.select("id", "user_id").join(active_user_ids, "user_id", "inner")
        cart_items = self.cart_items_df.select("cart_id", "product_id", "quantity")
        products = self.product_df.select("id", "category_id")

        # 3. Join on integer keys and aggregate total quantity per (user_id, category_id)
        user_cat_totals = carts.join(cart_items, carts["id"] == cart_items["cart_id"], "inner") \
                               .join(products, cart_items["product_id"] == products["id"], "inner") \
                               .groupBy("user_id", "category_id") \
                               .agg(F.sum("quantity").alias("total_quantity"))

        # 4. Rank top category per user using PySpark Windowing
        window_spec = Window.partitionBy("user_id").orderBy(col("total_quantity").desc())
        top_user_categories = user_cat_totals.withColumn("rank", row_number().over(window_spec)) \
                                             .filter(col("rank") == 1) \
                                             .drop("rank")

        # 5. Late Enrichment: Join user names and category names at the end
        users = self.user_df.select("id", "name")
        categories = self.categories_df.select("id", "name")

        preference_df = top_user_categories \
            .join(users, top_user_categories["user_id"] == users["id"], "inner") \
            .join(categories, top_user_categories["category_id"] == categories["id"], "inner") \
            .select(
                top_user_categories["user_id"],
                users["name"].alias("user_name"),
                top_user_categories["category_id"],
                categories["name"].alias("category_name"),
                top_user_categories["total_quantity"]
            )

        print("================ Optimized Preference DataFrame ================")
        preference_df.show()
        return preference_df

    

if __name__ == "__main__":
    user_activity = UserActivity()
    print("********************** UserActivity Analytics ****************************")
    user_activity.get_preference_Category_df()
    print("closed")



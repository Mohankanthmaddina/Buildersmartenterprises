import sys
import os

# Ensure package imports resolve when executing directly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics.user_activity import UserActivity


def run_analytics():
    print("=" * 60)
    print("   BuildPro PySpark Data Analytics Subsystem Engine   ")
    print("=" * 60)

    user_activity = UserActivity()

    print("\n[+] Cart DataFrame:")
    user_activity.show_cart_df()

    print("\n[+] Product DataFrame:")
    user_activity.show_product_df()

    print("\n[+] User DataFrame:")
    user_activity.show_user_df()

    print("\n[+] OTPs DataFrame:")
    user_activity.show_otps_df()

    print("\n[+] Categories DataFrame:")
    user_activity.show_categories_df()


if __name__ == "__main__":
    run_analytics()

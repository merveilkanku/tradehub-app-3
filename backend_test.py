#!/usr/bin/env python3
import requests
import json
import time
import random
import string
import os
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://915b63e0-4ee0-4165-9b78-2b245599c367.preview.emergentagent.com/api"
TEST_USER_EMAIL = "testuser@example.com"
TEST_SUPPLIER_EMAIL = "testsupplier@example.com"
TEST_PASSWORD = "TestPassword123!"

# Test data
test_user = {
    "email": TEST_USER_EMAIL,
    "password": TEST_PASSWORD,
    "full_name": "Test User",
    "phone": "+123456789",
    "country": "Sénégal",
    "city": "Dakar",
    "address": "123 Test Street",
    "user_type": "user"
}

test_supplier = {
    "email": TEST_SUPPLIER_EMAIL,
    "password": TEST_PASSWORD,
    "full_name": "Test Supplier",
    "phone": "+987654321",
    "country": "Cameroun",
    "city": "Yaoundé",
    "address": "456 Supplier Avenue",
    "user_type": "supplier"
}

test_product = {
    "name": f"Test Product {int(time.time())}",
    "description": "This is a test product description with detailed information.",
    "price": 99.99,
    "category": "Électronique",
    "stock_quantity": 10,
    "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
}

# Utility functions
def print_separator(title):
    print("\n" + "=" * 80)
    print(f" {title} ".center(80, "="))
    print("=" * 80)

def print_response(response, include_body=True):
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    if include_body:
        try:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response Body: {response.text[:500]}")
    print("-" * 80)

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# Test functions
def test_server_connection():
    print_separator("Testing Server Connection")
    try:
        response = requests.get(f"{BASE_URL}/categories")
        print_response(response)
        if response.status_code == 200:
            print("✅ Server connection successful")
            return True
        else:
            print("❌ Server connection failed")
            return False
    except Exception as e:
        print(f"❌ Server connection error: {str(e)}")
        return False

def test_auth_signup_signin(user_data):
    print_separator(f"Testing Authentication for {user_data['user_type']}")
    
    # Test signup
    print(f"Testing signup for {user_data['email']}")
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=user_data)
        print_response(response)
        if response.status_code == 200:
            print(f"✅ Signup successful for {user_data['user_type']}")
        else:
            print(f"❌ Signup failed for {user_data['user_type']}")
            return None
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        return None
    
    # Test signin
    print(f"Testing signin for {user_data['email']}")
    try:
        login_data = {
            "identifier": user_data['email'],
            "password": user_data['password']
        }
        response = requests.post(f"{BASE_URL}/auth/signin", json=login_data)
        print_response(response)
        if response.status_code == 200:
            print(f"✅ Signin successful for {user_data['user_type']}")
            return response.json()
        else:
            print(f"❌ Signin failed for {user_data['user_type']}")
            return None
    except Exception as e:
        print(f"❌ Signin error: {str(e)}")
        return None

def test_categories_endpoint():
    print_separator("Testing Categories Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/categories")
        print_response(response)
        if response.status_code == 200 and "categories" in response.json():
            print("✅ Categories endpoint working")
            return True
        else:
            print("❌ Categories endpoint failed")
            return False
    except Exception as e:
        print(f"❌ Categories endpoint error: {str(e)}")
        return False

def test_locations_endpoint():
    print_separator("Testing Locations Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/locations")
        print_response(response)
        if response.status_code == 200 and "countries" in response.json():
            print("✅ Locations endpoint working")
            return True
        else:
            print("❌ Locations endpoint failed")
            return False
    except Exception as e:
        print(f"❌ Locations endpoint error: {str(e)}")
        return False

def test_products_endpoint():
    print_separator("Testing Products Endpoint (Public)")
    try:
        response = requests.get(f"{BASE_URL}/products")
        print_response(response)
        if response.status_code == 200 and "products" in response.json():
            print("✅ Products endpoint working")
            return True
        else:
            print("❌ Products endpoint failed")
            return False
    except Exception as e:
        print(f"❌ Products endpoint error: {str(e)}")
        return False

def test_product_management(auth_data):
    if not auth_data or "access_token" not in auth_data:
        print("❌ Cannot test product management without authentication")
        return False
    
    access_token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {access_token}"}
    
    print_separator("Testing Product Management")
    
    # Create product
    print("Testing product creation")
    try:
        response = requests.post(f"{BASE_URL}/products", json=test_product, headers=headers)
        print_response(response)
        if response.status_code == 200 and "id" in response.json():
            product_id = response.json()["id"]
            print(f"✅ Product creation successful. Product ID: {product_id}")
        else:
            print("❌ Product creation failed")
            return False
    except Exception as e:
        print(f"❌ Product creation error: {str(e)}")
        return False
    
    # Get product details
    print(f"Testing get product details for ID: {product_id}")
    try:
        response = requests.get(f"{BASE_URL}/products/{product_id}")
        print_response(response)
        if response.status_code == 200 and response.json()["id"] == product_id:
            print("✅ Get product details successful")
        else:
            print("❌ Get product details failed")
    except Exception as e:
        print(f"❌ Get product details error: {str(e)}")
    
    # Update product
    print(f"Testing product update for ID: {product_id}")
    update_data = {
        "name": f"Updated Product {int(time.time())}",
        "price": 129.99
    }
    try:
        response = requests.put(f"{BASE_URL}/products/{product_id}", json=update_data, headers=headers)
        print_response(response)
        if response.status_code == 200 and "name" in response.json() and update_data["name"] == response.json()["name"]:
            print("✅ Product update successful")
        else:
            print("❌ Product update failed")
    except Exception as e:
        print(f"❌ Product update error: {str(e)}")
    
    # Test product like
    print(f"Testing product like for ID: {product_id}")
    try:
        response = requests.post(f"{BASE_URL}/products/{product_id}/like", headers=headers)
        print_response(response)
        if response.status_code == 200:
            print("✅ Product like successful")
        else:
            print("❌ Product like failed")
    except Exception as e:
        print(f"❌ Product like error: {str(e)}")
    
    # Test comment creation
    print(f"Testing comment creation for product ID: {product_id}")
    comment_data = {
        "product_id": product_id,
        "content": f"Test comment {random_string()}"
    }
    try:
        response = requests.post(f"{BASE_URL}/comments", json=comment_data, headers=headers)
        print_response(response)
        if response.status_code == 200 and "id" in response.json():
            print("✅ Comment creation successful")
        else:
            print("❌ Comment creation failed")
    except Exception as e:
        print(f"❌ Comment creation error: {str(e)}")
    
    # Delete product
    print(f"Testing product deletion for ID: {product_id}")
    try:
        response = requests.delete(f"{BASE_URL}/products/{product_id}", headers=headers)
        print_response(response)
        if response.status_code == 200:
            print("✅ Product deletion successful")
            return True
        else:
            print("❌ Product deletion failed")
            return False
    except Exception as e:
        print(f"❌ Product deletion error: {str(e)}")
        return False

def test_messaging(user_auth, supplier_auth):
    if not user_auth or not supplier_auth:
        print("❌ Cannot test messaging without both user and supplier authentication")
        return False
    
    user_token = user_auth["access_token"]
    user_id = user_auth["user"]["id"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    supplier_token = supplier_auth["access_token"]
    supplier_id = supplier_auth["user"]["id"]
    supplier_headers = {"Authorization": f"Bearer {supplier_token}"}
    
    print_separator("Testing Messaging System")
    
    # User sends message to supplier
    print("Testing user sending message to supplier")
    user_message = {
        "recipient_id": supplier_id,
        "content": f"Hello supplier! This is a test message from user at {datetime.now().isoformat()}"
    }
    try:
        response = requests.post(f"{BASE_URL}/messages", json=user_message, headers=user_headers)
        print_response(response)
        if response.status_code == 200 and "id" in response.json():
            print("✅ User message to supplier successful")
        else:
            print("❌ User message to supplier failed")
            return False
    except Exception as e:
        print(f"❌ User message error: {str(e)}")
        return False
    
    # Supplier sends message to user
    print("Testing supplier sending message to user")
    supplier_message = {
        "recipient_id": user_id,
        "content": f"Hello user! This is a test reply from supplier at {datetime.now().isoformat()}"
    }
    try:
        response = requests.post(f"{BASE_URL}/messages", json=supplier_message, headers=supplier_headers)
        print_response(response)
        if response.status_code == 200 and "id" in response.json():
            print("✅ Supplier message to user successful")
        else:
            print("❌ Supplier message to user failed")
            return False
    except Exception as e:
        print(f"❌ Supplier message error: {str(e)}")
        return False
    
    # User gets conversations
    print("Testing user getting conversations")
    try:
        response = requests.get(f"{BASE_URL}/messages", headers=user_headers)
        print_response(response)
        if response.status_code == 200 and len(response.json()) > 0:
            print("✅ User getting conversations successful")
        else:
            print("❌ User getting conversations failed")
    except Exception as e:
        print(f"❌ User getting conversations error: {str(e)}")
    
    # User gets specific conversation with supplier
    print(f"Testing user getting conversation with supplier (ID: {supplier_id})")
    try:
        response = requests.get(f"{BASE_URL}/messages/{supplier_id}", headers=user_headers)
        print_response(response)
        if response.status_code == 200 and len(response.json()) > 0:
            print("✅ User getting specific conversation successful")
            return True
        else:
            print("❌ User getting specific conversation failed")
            return False
    except Exception as e:
        print(f"❌ User getting specific conversation error: {str(e)}")
        return False

def test_unauthorized_access():
    print_separator("Testing Unauthorized Access")
    
    # Try to access profile without token
    print("Testing profile access without token")
    try:
        response = requests.get(f"{BASE_URL}/profile")
        print_response(response)
        if response.status_code == 401 or response.status_code == 403:
            print("✅ Unauthorized profile access correctly rejected")
        else:
            print("❌ Unauthorized profile access not properly handled")
    except Exception as e:
        print(f"❌ Unauthorized profile access test error: {str(e)}")
    
    # Try to create product without token
    print("Testing product creation without token")
    try:
        response = requests.post(f"{BASE_URL}/products", json=test_product)
        print_response(response)
        if response.status_code == 401 or response.status_code == 403:
            print("✅ Unauthorized product creation correctly rejected")
            return True
        else:
            print("❌ Unauthorized product creation not properly handled")
            return False
    except Exception as e:
        print(f"❌ Unauthorized product creation test error: {str(e)}")
        return False

def run_all_tests():
    print_separator("STARTING TRADHUB BACKEND API TESTS")
    print(f"Testing against: {BASE_URL}")
    print(f"Test started at: {datetime.now().isoformat()}")
    
    # Test results tracking
    results = {
        "server_connection": False,
        "categories_endpoint": False,
        "locations_endpoint": False,
        "products_endpoint": False,
        "user_auth": False,
        "supplier_auth": False,
        "product_management": False,
        "messaging": False,
        "unauthorized_access": False
    }
    
    # 1. Test server connection
    results["server_connection"] = test_server_connection()
    if not results["server_connection"]:
        print("❌ Server connection failed. Aborting further tests.")
        return results
    
    # 2. Test core public endpoints
    results["categories_endpoint"] = test_categories_endpoint()
    results["locations_endpoint"] = test_locations_endpoint()
    results["products_endpoint"] = test_products_endpoint()
    
    # 3. Test authentication
    user_auth = test_auth_signup_signin(test_user)
    results["user_auth"] = user_auth is not None
    
    supplier_auth = test_auth_signup_signin(test_supplier)
    results["supplier_auth"] = supplier_auth is not None
    
    # 4. Test product management (requires supplier auth)
    if results["supplier_auth"]:
        results["product_management"] = test_product_management(supplier_auth)
    else:
        print("❌ Skipping product management tests due to failed supplier authentication")
    
    # 5. Test messaging (requires both user and supplier auth)
    if results["user_auth"] and results["supplier_auth"]:
        results["messaging"] = test_messaging(user_auth, supplier_auth)
    else:
        print("❌ Skipping messaging tests due to failed authentication")
    
    # 6. Test unauthorized access
    results["unauthorized_access"] = test_unauthorized_access()
    
    # Print summary
    print_separator("TEST SUMMARY")
    for test, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test.replace('_', ' ').title()}: {status}")
    
    all_passed = all(results.values())
    print(f"\nOverall Result: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    return results

if __name__ == "__main__":
    run_all_tests()
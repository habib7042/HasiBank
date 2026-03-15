from playwright.sync_api import sync_playwright
import json
import time

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock API responses to ensure UI testing works regardless of DB state
        def handle_api(route, response_data):
            route.fulfill(
                content_type="application/json",
                body=json.dumps(response_data)
            )

        # Mock Users
        page.route("**/api/users", lambda route: handle_api(route, {
            "users": [
                {"id": "1", "name": "Habib"},
                {"id": "2", "name": "Shitu"}
            ]
        }))

        # Mock Totals
        page.route("**/api/totals", lambda route: handle_api(route, {
            "bankTotal": 1000,
            "userTotals": []
        }))

        # Mock Deposits
        page.route("**/api/deposits", lambda route: handle_api(route, {
            "deposits": []
        }))

        # Mock Init
        page.route("**/api/init", lambda route: handle_api(route, {
            "success": True
        }))

        # Mock Auth
        page.route("**/api/auth/verify-pin", lambda route: handle_api(route, {
            "success": True,
            "message": "PIN verified successfully"
        }))

        # Mock Memories List
        page.route("**/api/memories*", lambda route: handle_api(route, {
            "memories": [
                {
                    "id": 1,
                    "imageUrl": "https://via.placeholder.com/300",
                    "description": "Test Memory",
                    "date": "2023-01-01T00:00:00.000Z",
                    "user": {"name": "Habib"},
                    "images": [],
                    "comments": []
                }
            ],
            "pagination": {"pages": 1, "currentPage": 1}
        }))

        # Mock Memory Detail
        page.route("**/api/memories/1", lambda route: handle_api(route, {
            "memory": {
                "id": 1,
                "imageUrl": "https://via.placeholder.com/300",
                "description": "Test Memory Detail",
                "date": "2023-01-01T00:00:00.000Z",
                "user": {"name": "Habib"},
                "images": [],
                "comments": [
                    {
                        "id": 1,
                        "content": "Nice photo!",
                        "createdAt": "2023-01-01T00:00:00.000Z",
                        "user": {"name": "Shitu"},
                        "reactions": []
                    }
                ]
            }
        }))

        # Mock Notebook
        page.route("**/api/notes*", lambda route: handle_api(route, {
            "notes": [],
            "pagination": {"pages": 1, "currentPage": 1}
        }))

        print("Navigating to home...")
        # 1. Navigate to home
        page.goto("http://localhost:3000")

        # 2. Inject authentication and unlock gates
        page.evaluate("""
            localStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('gate_unlocked_memories', 'true');
            sessionStorage.setItem('gate_unlocked_kothabank', 'true');
        """)

        print("Reloading...")
        # Reload to apply auth
        page.reload()

        # 3. Wait for Dashboard
        try:
            page.wait_for_selector("text=Dashboard", timeout=10000)
            print("Dashboard loaded.")
        except:
            print("Dashboard failed to load. Taking screenshot.")
            page.screenshot(path="/home/jules/verification/dashboard_fail.png")
            raise

        # Verify Floating WhatsApp Button exists
        whatsapp_btn = page.locator("button[title='Contact Admin on WhatsApp']")
        if whatsapp_btn.is_visible():
            print("Floating WhatsApp Button is visible.")
        else:
            print("Floating WhatsApp Button NOT found.")

        # 4. Navigate to Memories
        print("Clicking Memories...")
        page.click("text=Memories")

        # 5. Verify Identity Gate
        try:
            # Wait for Identity Gate Title
            page.wait_for_selector("text=Who is viewing Memories?", timeout=5000)
            print("Identity Gate visible.")
        except:
             print("Identity Gate NOT visible.")
             page.screenshot(path="/home/jules/verification/gate_fail.png")
             # Try to see what's there
             return

        # 6. Select an Identity
        try:
             # Find any button inside the identity gate card content
             # We mocked 2 users, so buttons should exist.
             identity_button = page.locator("button span:has-text('Habib')").first
             identity_button.wait_for(timeout=5000)
             identity_button.click()
             print("Identity 'Habib' selected.")
        except:
             print("Failed to select identity.")

        # 7. Wait for Memories Gallery
        try:
            page.wait_for_selector("text=Filter Memories", timeout=5000)
            print("Memories Gallery loaded.")
        except:
            print("Memories Gallery failed to load.")
            page.screenshot(path="/home/jules/verification/gallery_fail.png")
            return

        # 8. Open Memory Modal
        try:
            # We mocked one memory with text "Test Memory"
            memory_card = page.locator("text=Test Memory").first
            if memory_card.is_visible():
                memory_card.click()
                print("Clicked memory card.")

                # Wait for Modal content
                page.wait_for_selector("text=Test Memory Detail", timeout=5000)
                print("Modal opened.")

                # Wait a bit for layout
                page.wait_for_timeout(1000)
            else:
                print("Memory card not visible.")
        except Exception as e:
             print(f"Failed to open modal: {e}")

        # 9. Take Screenshot
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot saved to /home/jules/verification/verification.png")

        browser.close()

if __name__ == "__main__":
    verify_frontend()

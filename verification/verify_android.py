from playwright.sync_api import Page, expect, sync_playwright

def test_mobile_app_navigation(page: Page):
    # 1. Go to Home Page
    print("Navigating to home page...")
    page.goto("http://localhost:3000")

    # 2. Check for Mobile App link on Login Screen
    print("Checking for Mobile App link...")
    mobile_link = page.get_by_text("Switch to Mobile App View 📱")
    expect(mobile_link).to_be_visible()

    # 3. Click it and verify navigation
    print("Clicking Mobile App link...")
    mobile_link.click()
    expect(page).to_have_url("http://localhost:3000/android")

    # 4. Verify Mobile App Login Page
    print("Verifying Android page content...")
    expect(page.get_by_text("Hashi Mobile")).to_be_visible()
    expect(page.get_by_placeholder("••••")).to_be_visible()

    # 5. Screenshot
    print("Taking screenshot...")
    page.screenshot(path="verification/android_app.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_mobile_app_navigation(page)
            print("Test passed!")
        except Exception as e:
            print(f"Test failed: {e}")
            page.screenshot(path="verification/failure.png")
        finally:
            browser.close()

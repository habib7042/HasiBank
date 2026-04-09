import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to home page...")
        await page.goto("http://localhost:3000")

        try:
            await page.wait_for_selector("text=Loading your vault...", state="hidden", timeout=15000)
        except Exception:
            pass

        await page.wait_for_timeout(3000)

        try:
            print("Entering correct PIN...")
            await page.locator("button:has-text('7')").click()
            await page.locator("button:has-text('0')").click()
            await page.locator("button:has-text('4')").click()
            await page.locator("button:has-text('2')").click()

            print("Waiting for Security Check...")
            await page.wait_for_selector("text=Final Security Check", timeout=15000)

            print("Answering security question...")
            # Use specific locator for the security question input, the PIN input is readonly
            await page.locator("input[placeholder='Type your answer...']").fill("pagli")

            await page.locator("button", has_text="Verify Identity").click()

            print("Waiting for Dashboard...")
            await page.wait_for_selector("text=Dashboard", timeout=15000)
            await page.wait_for_timeout(2000)

            print("Navigating to PrioDak...")
            # Click the PrioDak app icon
            await page.locator("div.flex.flex-col.items-center", has_text="PrioDak").click()
            await page.wait_for_timeout(3000)

            # Identify who is accessing if identity gate is present
            if await page.locator("text=Who is adding this PrioDak?").count() > 0:
                 print("PrioDak IdentityGate found. Selecting User...")
                 # Click the first user button by role
                 await page.locator("button", has_text="Habib").click()
                 await page.wait_for_timeout(2000)

            print("Creating a new PrioDak...")
            try:
                await page.locator("input[placeholder*='নতুন ডাক নাম']").fill("মায়াবতী")
                await page.locator("button[type='submit']").click()
                await page.wait_for_timeout(3000)

                # Click the newly created card to trigger the active state/animation
                print("Clicking card to trigger animation...")
                # The text may be inside a span, try to click the containing div or wait for it
                await page.locator("text=মায়াবতী").first.click(timeout=5000)
                await page.wait_for_timeout(1000)
            except Exception as e:
                print(f"Could not interact with PrioDak input: {e}")

            print("Capturing PrioDak page screenshot...")
            os.makedirs("verification", exist_ok=True)
            await page.screenshot(path="verification/priodak_page.png", full_page=True)

        except Exception as e:
            print(f"Error occurred: {e}")
            await page.screenshot(path="verification/error_priodak_state.png", full_page=True)

        print("Verification complete!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())

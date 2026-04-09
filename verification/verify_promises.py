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
            input_element = page.locator("input[type='text']")
            if await input_element.count() > 0:
                await input_element.fill("pagli")
            else:
                await page.locator("input[placeholder='Type your answer...']").fill("pagli")

            await page.locator("button", has_text="Verify Identity").click()

            print("Waiting for Dashboard...")
            await page.wait_for_selector("text=Promises", timeout=15000)
            await page.wait_for_timeout(2000)

            print("Navigating to Promises...")
            await page.locator("div.flex.flex-col.items-center", has_text="Promises").click()
            await page.wait_for_timeout(3000)

            # Handle PinGate if present
            if await page.locator("text=Promises Locked").count() > 0 or await page.locator("text=Enter PIN to view promises").count() > 0:
                 print("Promises PinGate found. Entering PIN...")
                 await page.locator("button:has-text('7')").click()
                 await page.locator("button:has-text('0')").click()
                 await page.locator("button:has-text('4')").click()
                 await page.locator("button:has-text('2')").click()
                 await page.wait_for_timeout(2000)

            # Identify who is accessing if identity gate is present
            if await page.locator("text=Who is making this promise?").count() > 0:
                 print("Promises IdentityGate found. Selecting Habib...")
                 await page.locator("button", has_text="Habib").click()
                 await page.wait_for_timeout(2000)

            # Create a mock promise if it does not exist by interacting with the UI
            print("Checking if we need to create a promise...")
            if await page.locator("text=No promises yet").count() > 0 or await page.locator("text=What is your promise?").count() > 0:
                 print("Creating a new promise...")
                 # Assuming there's an input field
                 try:
                     await page.locator("input[placeholder*='What is your promise?']").fill("I will code every day")
                     await page.locator("button:has-text('Promise')").click()
                     await page.wait_for_timeout(3000)
                 except Exception as e:
                     print(f"Could not interact with promise input: {e}")

            print("Capturing Promises page screenshot...")
            os.makedirs("verification", exist_ok=True)
            await page.screenshot(path="verification/promises_page.png", full_page=True)

        except Exception as e:
            print(f"Error occurred: {e}")
            await page.screenshot(path="verification/error_promises_state.png")

        print("Verification complete!")
        await browser.close()

asyncio.run(run())

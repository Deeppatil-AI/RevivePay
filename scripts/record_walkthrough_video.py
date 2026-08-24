import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def record_demo():
    print("[*] Starting RevivePay Automated Walkthrough Video Recording...")
    os.makedirs("recorded_videos", exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir="recorded_videos",
            record_video_size={"width": 1920, "height": 1080}
        )
        
        page = await context.new_page()
        
        # 1. Open RevivePay Live Solution App
        print("[+] Step 1: Loading Solution App Console...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # 2. Showcase Chaos Monkey and Bank Telemetry
        print("[+] Step 2: Showcasing Batch Auto-Pilot & Bank Telemetry...")
        await page.mouse.wheel(0, 150)
        await page.wait_for_timeout(2000)
        
        # Click "Step (1 Txn)" twice to show individual diagnosis
        step_btn = page.locator("button:has-text('Step (1 Txn)')")
        if await step_btn.count() > 0:
            await step_btn.click()
            await page.wait_for_timeout(2000)
            await step_btn.click()
            await page.wait_for_timeout(2000)
        
        # Run Instant Full Batch
        full_batch_btn = page.locator("button:has-text('Instant Full Batch')")
        if await full_batch_btn.count() > 0:
            await full_batch_btn.click()
            await page.wait_for_timeout(3000)
        
        # 3. Open Hinglish Recovery & UPI QR Code
        print("[+] Step 3: Opening WhatsApp Hinglish Recovery & Dynamic UPI QR...")
        whatsapp_btn = page.locator("button[aria-label*='WhatsApp'], button:has-text('WhatsApp')").first
        if await whatsapp_btn.count() > 0:
            await whatsapp_btn.click()
            await page.wait_for_timeout(2500)
            
            # Switch Language to Hindi
            hindi_btn = page.locator("button:has-text('Hindi')")
            if await hindi_btn.count() > 0:
                await hindi_btn.click()
                await page.wait_for_timeout(2000)
            
            # Click Pay via UPI Intent
            pay_intent_btn = page.locator("button:has-text('Pay INR'), button:has-text('Pay')").first
            if await pay_intent_btn.count() > 0:
                try:
                    await pay_intent_btn.click()
                    await page.wait_for_timeout(2500)
                except:
                    pass
        
        # Close modal via Escape
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1500)
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(1000)
        
        # 4. Navigate to Decision Audit Trail
        print("[+] Step 4: Inspecting Decision Audit Trail...")
        await page.click("button:has-text('Decision Audit Trail')")
        await page.wait_for_timeout(3000)
        await page.mouse.wheel(0, 250)
        await page.wait_for_timeout(1500)
        await page.mouse.wheel(0, -250)
        await page.wait_for_timeout(1500)
        
        # 5. Navigate to B2B Receivables & PTP
        print("[+] Step 5: Demonstrating B2B Receivables & PTP...")
        await page.click("button:has-text('B2B Receivables & PTP')")
        await page.wait_for_timeout(3000)
        
        # Settle invoice via Smart Collect
        settle_btn = page.locator("button:has-text('Settle via Smart Collect')").first
        if await settle_btn.count() > 0:
            await settle_btn.click()
            await page.wait_for_timeout(2500)
            
        # 6. Navigate to DisputeShield
        print("[+] Step 6: Demonstrating DisputeShield & 4-Point Evidentiary PDF...")
        await page.click("button:has-text('DisputeShield')")
        await page.wait_for_timeout(3000)
        
        dossier_btn = page.locator("button:has-text('View Evidentiary Dossier')").first
        if await dossier_btn.count() > 0:
            await dossier_btn.click()
            await page.wait_for_timeout(3000)
            
            # Export PDF
            pdf_btn = page.locator("button:has-text('Export as PDF')")
            if await pdf_btn.count() > 0:
                await pdf_btn.click()
                await page.wait_for_timeout(2000)
                
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(1500)

        # 7. Navigate to Live Webhook Tester
        print("[+] Step 7: Testing Live Webhook Ingestion...")
        await page.click("button:has-text('Live Webhook Tester')")
        await page.wait_for_timeout(2500)
        
        dispatch_btn = page.locator("button:has-text('Dispatch Simulated Webhook')")
        if await dispatch_btn.count() > 0:
            await dispatch_btn.click()
            await page.wait_for_timeout(2500)

        # 8. Navigate to ROI & Cash Forecast
        print("[+] Step 8: Demonstrating Double-Entry Ledger Trial Balance & Analytics...")
        await page.click("button:has-text('ROI & Cash Forecast')")
        await page.wait_for_timeout(3500)
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(2500)
        await page.mouse.wheel(0, -350)
        await page.wait_for_timeout(1500)

        # 9. Open Agentic UAP Modal
        print("[+] Step 9: Demonstrating Agentic Commerce UAP...")
        agentic_btn = page.locator("button:has-text('Agentic UAP')")
        if await agentic_btn.count() > 0:
            await agentic_btn.click()
            await page.wait_for_timeout(2500)
            
            deal_btn = page.locator("button:has-text('Negotiate Autonomous Deal')")
            if await deal_btn.count() > 0:
                await deal_btn.click()
                await page.wait_for_timeout(3000)
                
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(1500)

        # 10. Open RBI Certificate Modal
        print("[+] Step 10: Demonstrating RBI Compliance Certificate...")
        cert_btn = page.locator("button:has-text('RBI Certificate')")
        if await cert_btn.count() > 0:
            await cert_btn.click()
            await page.wait_for_timeout(3000)
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(1000)
            
        print("[+] Completing video recording...")
        await page.wait_for_timeout(2000)
        
        # Get video path before closing page
        video = page.video
        await page.close()
        await context.close()
        await browser.close()
        
        if video:
            video_path = await video.path()
            target_path = os.path.abspath("recorded_videos/revivepay_solution_walkthrough.webm")
            shutil.copy(video_path, target_path)
            shutil.copy(video_path, os.path.abspath("walkthrough_demo_video.webm"))
            print(f"[SUCCESS] Walkthrough Video saved to:\n  -> {target_path}\n  -> {os.path.abspath('walkthrough_demo_video.webm')}")

if __name__ == "__main__":
    asyncio.run(record_demo())

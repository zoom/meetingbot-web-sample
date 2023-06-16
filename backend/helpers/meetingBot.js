const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");
const { execSync } = require("child_process");
const fss = require("fs");
const path = require("path");

async function clickJoinMeetingButton() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--use-fake-ui-for-media-stream"],
  });
  const page = await browser.newPage();

  await page.goto("Enter Local Development URL or Site", {
    waitUntil: "load",

    timeout: 0,
  });

  //  // Configure the navigation timeout
  await page.setDefaultNavigationTimeout(0);

  await Promise.all([page.click("button"), page.waitForNavigation()]);
  await page.waitForNavigation(); // Wait for the page to fully load
  await page.click("zm-btn join-audio-by-voip__join-btn");

  // click Join Audio by Computer Button
  const button = await page.$(".join-audio-by-voip__join-btn");

  if (button) {
    console.log("Backend: button not found");
    setTimeout(clickJoinMeetingButton(), 1000); // Try again in 1 second
  } else {
    console.log("Backend: button found");
    // await page.waitForTimeout(4000)

    console.log("Backend: Clicking button", button);

    await button.click();
  }

  //close the browser
  await browser.close();
}

clickJoinMeetingButton();

function removeChromiumAlert() {
  try {
    const chromiumPath = "/chrome-mac/Chromium.app";
    const macPath = path.join(
      path.dirname(require.resolve("puppeteer")),
      "/.local-chromium/"
    );
    const [generatedDir] = fss
      .readdirSync(macPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
    const chromiumAppPath = path.join(macPath, generatedDir, chromiumPath);
    const mode = `0${(
      fss.statSync(chromiumAppPath).mode & parseInt("777", 8)
    ).toString(8)}`;

    if (mode !== "0777") {
      execSync(`sudo chmod 777 ${chromiumAppPath}`);
      execSync(`sudo codesign --force --deep --sign - ${chromiumAppPath}`);
    }
  } catch (err) {
    console.warn(
      "unable to sign Chromium, u may see the annoying message when the browser start"
    );
    console.warn(err);
  }
}

module.exports = { clickJoinMeetingButton };

/**
 *  How to schdule a Job
 * 1. use setInterval function
 * 2. use node-cron
 * 3. use linux cron to schedule a job at a specific time.
 *    Just need to run the script at OS level. OS will call
 *    and run the script - robust and reliable to run a task.
 */

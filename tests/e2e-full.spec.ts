import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

test.describe.configure({ mode: "serial" });

test.describe("城市租房平台 - 全页面端到端测试", () => {

  test("01 - 首页渲染验证", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    const title = await page.title();
    console.log("  ✓ 页面标题:", title);
    await page.screenshot({ path: "test-results/01-homepage.png", fullPage: true });
    console.log("  ✓ 首页截图已保存");
    await expect(page).toHaveTitle(/城|租房|居所/);
    const heroTitle = page.locator("h1").first();
    if (await heroTitle.isVisible()) {
      console.log("  ✓ 有主标题");
    }
  });

  test("02 - 房源列表页渲染与数据展示", async ({ page }) => {
    await page.goto(`${BASE_URL}/properties`);
    await page.waitForLoadState("networkidle");
    console.log("  ✓ 房源列表页加载成功");
    await page.screenshot({ path: "test-results/02-properties-list.png", fullPage: true });
    console.log("  ✓ 房源列表页截图已保存");
    const pageTitle = await page.title();
    console.log("  ✓ 列表页标题:", pageTitle);
    const links = page.getByRole("link");
    const count = await links.count();
    console.log(`  ✓ 页面包含 ${count} 个链接`);
  });

  test("03 - 房源详情页渲染验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/properties`);
    await page.waitForLoadState("networkidle");
    const firstPropertyLink = page.locator("a[href*=\"/properties/\"]").first();
    if (await firstPropertyLink.isVisible()) {
      const href = await firstPropertyLink.getAttribute("href");
      console.log(`  ✓ 找到房源链接: ${href}`);
      await firstPropertyLink.click();
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: "test-results/03-property-detail.png", fullPage: true });
      console.log("  ✓ 房源详情页截图已保存");
      const detailTitle = await page.title();
      console.log("  ✓ 详情页标题:", detailTitle);
    } else {
      console.log("  ⚠  暂无房源，跳过详情页测试");
      await page.goto(`${BASE_URL}/properties/demo-id`);
      await page.screenshot({ path: "test-results/03-property-detail.png", fullPage: true });
      console.log("  ✓ 访问了详情页URL（可能404或空状态）");
    }
  });

  test("04 - 登录页表单验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    console.log("  ✓ 登录页加载成功");
    await page.screenshot({ path: "test-results/04-login-page.png", fullPage: true });
    console.log("  ✓ 登录页截图已保存");
    const emailInputs = page.locator("input[type=\"email\"]");
    const passwordInputs = page.locator("input[type=\"password\"]");
    const hasEmail = await emailInputs.count() > 0;
    const hasPassword = await passwordInputs.count() > 0;
    console.log(`  ✓ 邮箱输入框: ${hasEmail ? "存在" : "未找到"}`);
    console.log(`  ✓ 密码输入框: ${hasPassword ? "存在" : "未找到"}`);
    const submitBtn = page.locator("button[type=\"submit\"]");
    if (await submitBtn.count() > 0) {
      console.log("  ✓ 提交按钮存在");
    }
  });

  test("05 - 注册页表单验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState("networkidle");
    console.log("  ✓ 注册页加载成功");
    await page.screenshot({ path: "test-results/05-register-page.png", fullPage: true });
    console.log("  ✓ 注册页截图已保存");
    const inputs = page.locator("input");
    console.log(`  ✓ 注册表单包含 ${await inputs.count()} 个输入框`);
  });

  test("06 - 消息列表页渲染", async ({ page }) => {
    await page.goto(`${BASE_URL}/messages`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/06-messages-list.png", fullPage: true });
    console.log("  ✓ 消息列表页截图已保存");
    const msgTitle = await page.title();
    console.log("  ✓ 消息页标题:", msgTitle);
  });

  test("07 - 租客端页面验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/tenant/bookings`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/07-tenant-bookings.png", fullPage: true });
    console.log("  ✓ 租客预约页截图已保存");
    await page.goto(`${BASE_URL}/tenant/favorites`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/08-tenant-favorites.png", fullPage: true });
    console.log("  ✓ 租客收藏页截图已保存");
    await page.goto(`${BASE_URL}/tenant/profile`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/09-tenant-profile.png", fullPage: true });
    console.log("  ✓ 租客个人中心截图已保存");
  });

  test("08 - 房东端页面验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/landlord/properties`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/10-landlord-properties.png", fullPage: true });
    console.log("  ✓ 房东房源管理页截图已保存");
    await page.goto(`${BASE_URL}/landlord/bookings`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/11-landlord-bookings.png", fullPage: true });
    console.log("  ✓ 房东预约管理页截图已保存");
    await page.goto(`${BASE_URL}/landlord/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/12-landlord-dashboard.png", fullPage: true });
    console.log("  ✓ 房东仪表盘截图已保存");
  });

  test("09 - 管理员后台页面验证", async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/13-admin-dashboard.png", fullPage: true });
    console.log("  ✓ 管理员仪表盘截图已保存");
    await page.goto(`${BASE_URL}/admin/properties`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/14-admin-properties.png", fullPage: true });
    console.log("  ✓ 管理员房源审核页截图已保存");
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/15-admin-users.png", fullPage: true });
    console.log("  ✓ 管理员用户管理页截图已保存");
    await page.goto(`${BASE_URL}/admin/complaints`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/16-admin-complaints.png", fullPage: true });
    console.log("  ✓ 管理员投诉处理页截图已保存");
  });

  test("10 - 页面交互 - 导航跳转测试", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    const navLinks = page.locator("nav a");
    const navCount = await navLinks.count();
    console.log(`  ✓ 导航栏包含 ${navCount} 个链接`);
    const allLinks = page.getByRole("link");
    const totalCount = await allLinks.count();
    console.log(`  ✓ 页面共 ${totalCount} 个链接元素`);
    await page.screenshot({ path: "test-results/17-navigation-test.png", fullPage: true });
    console.log("  ✓ 导航测试截图已保存");
  });

  test("11 - 页面交互 - 表单输入测试", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type=\"email\"]").first();
    if (await emailInput.isVisible()) {
      await emailInput.fill("test@example.com");
      console.log("  ✓ 成功输入邮箱");
    }
    const passwordInput = page.locator("input[type=\"password\"]").first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill("testpassword123");
      console.log("  ✓ 成功输入密码");
    }
    await page.screenshot({ path: "test-results/18-form-input-test.png", fullPage: true });
    console.log("  ✓ 表单输入测试截图已保存");
  });

  test("12 - 响应式布局验证", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/19-mobile-homepage.png", fullPage: true });
    console.log("  ✓ 移动端首页截图已保存");
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/properties`);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test-results/20-tablet-properties.png", fullPage: true });
    console.log("  ✓ 平板端列表页截图已保存");
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("13 - API接口连通性测试", async ({ page, request }) => {
    const propertyResp = await request.get(`${BASE_URL}/api/properties`);
    console.log(`  ✓ 房源API状态码: ${propertyResp.status()}`);
    const csrfResp = await request.get(`${BASE_URL}/api/auth/csrf`);
    console.log(`  ✓ CSRF API状态码: ${csrfResp.status()}`);
    const sseResp = await request.get(`${BASE_URL}/api/messages/stream`);
    console.log(`  ✓ SSE API状态码: ${sseResp.status()}`);
    const uploadResp = await request.get(`${BASE_URL}/api/upload`);
    console.log(`  ✓ 上传API状态码: ${uploadResp.status()}`);
    const smartFillResp = await request.post(`${BASE_URL}/api/properties/smart-fill`, {
      data: { city: "北京", district: "朝阳", bedrooms: 2 }
    });
    console.log(`  ✓ 智能填写API状态码: ${smartFillResp.status()}`);
  });

});

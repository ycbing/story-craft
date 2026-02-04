import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create(.*)",
]);

const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. 获取认证状态
  const { userId } = await auth();

  // 场景 A: 已登录用户试图访问登录/注册页面
  if (userId && isAuthRoute(req)) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // 场景 B: 使用 auth.protect() 处理受保护路由
  // 这会自动处理未登录用户跳转到登录页，比手动重定向更安全
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // 这里的 matcher 设置得很好，避开了静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
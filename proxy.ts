import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 定义需要认证的受保护路由
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create(.*)",
]);

// 定义专门的认证路由 (登录/注册)
// 用于判断：如果用户已登录还想访问这些页面，就踢去 Dashboard
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const {userId} = await auth()
  // 场景 A: 已登录用户访问 "登录/注册" 页 -> 踢回 Dashboard
  if (userId && isAuthRoute(req)) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // 场景 B: 未登录用户访问受保护页面 -> 重定向到登录页
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    return Response.redirect(signInUrl);
  }
});

// 必须导出 Config，否则中间件会对静态资源运行
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
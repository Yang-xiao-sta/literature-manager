import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">没有找到这篇文献</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">这条记录可能已经被删除，或者当前链接不再有效。你可以回到工作台重新检索。</p>
        <div className="mt-6">
          <Link href="/" className={buttonVariants()}>
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}

import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col">
      <TopNav />
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 pb-32 overflow-auto">
        <div className="mx-auto max-w-screen-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}

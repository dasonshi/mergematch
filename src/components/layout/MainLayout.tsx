import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <TopNav />
      <main className="flex-1 min-h-0 w-full p-4 md:p-6 lg:p-8 pb-32 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}

import { TopNav } from "./TopNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <TopNav />
      <main className="flex-1 w-full p-4 md:p-6 lg:p-8 pb-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

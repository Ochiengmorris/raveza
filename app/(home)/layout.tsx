import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import NextTopLoader from "nextjs-toploader";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader showSpinner={false} />
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex flex-col flex-1 overflow-y-scroll">
          <main className="grow">{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}

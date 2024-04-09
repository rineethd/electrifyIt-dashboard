import Image from "next/image";
import Dashboard from "@/components/dashboard";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <header className="py-6 border-b border-gray-300">
        <div className="container mx-auto flex items-center justify-center lg:justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/electrifyIt.png"
              alt="ElectrifyIt Logo"
              width={100}
              height={24}
              priority
            />
            <span className="text-lg font-semibold text-black border border-gray-300 p-4 rounded-3xl tracking-widest">ElectrifyIt Dashboard</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <Dashboard />
      </main>
    </div>
  );
}

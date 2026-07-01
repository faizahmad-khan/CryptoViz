import Navbar from "../../components/layout/Navbar";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300">
            <Navbar />
            <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
                <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">Documentation</h1>
                <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
                    We are currently building out the official documentation for CryptoViz. Check back soon!
                </p>
            </div>
        </div>
    );
}
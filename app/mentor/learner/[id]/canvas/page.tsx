import { Volume2 } from "lucide-react";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ passphrase: string }>;
}) {
  const { passphrase } = await params;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-2">Canvas</h1>
        <p className="text-gray-600">
          A space for non-verbal expression and fun
        </p>
      </header>

      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Volume2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-500 max-w-md">
            The canvas provides a medium for learners to have fun and express
            themselves using sounds, images and more.
          </p>
        </div>
      </div>
    </div>
  );
}

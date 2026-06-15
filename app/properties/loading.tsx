import { Skeleton } from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-24 rounded-lg" />
            </div>

            <div className="flex items-center justify-between">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-full" />
                  <Skeleton className="h-9 w-28 rounded-full" />
                  <Skeleton className="h-9 w-20 rounded-full" />
                </div>
              </div>

              <div>
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

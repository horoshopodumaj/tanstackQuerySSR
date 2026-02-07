import { Geist, Geist_Mono } from "next/font/google";
import { getPosts } from "@/services/endpoints/postsService";
import React, {  useCallback, useRef} from "react";
import { IPost } from "@/services/types";
import { dehydrate, QueryClient, useInfiniteQuery } from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function getServerSideProps() {
  const queryClient = new QueryClient()

  await queryClient.prefetchInfiniteQuery({
    queryKey: ['posts'],
    queryFn: () => getPosts({pageParam: 1}),
    initialPageParam: 1,
  })

  return { props: { dehydratedState: dehydrate(queryClient)} }

}

export default function Home() {
    const observerRef = useRef<IntersectionObserver | null>(null);

    const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.length ? allPages?.length + 1 : undefined
    },
  })

const lastPostsRef = useCallback((node: HTMLLIElement | null): void => {
  if (isFetchingNextPage) return;

  if (observerRef.current) {
    observerRef.current.disconnect();
  }

  observerRef.current = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    }
  );

  if (node) {
    observerRef.current.observe(node);
  }
}, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center pt-[100px] justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between  px-16 bg-white dark:bg-black sm:items-start">

        <h1 className=" text-xl">Список постов</h1>
          {status === 'pending' ? (
              <p>Loading...</p>
            ) : status === 'error' ? (
              <p>Error: {error.message}</p>
            ) : (
              <>
                {data?.pages?.map((page, i) => (
                  <div key={i} className=" text-sm text-center sm:text-left">
                    {page?.map((post: IPost) => (
                      <li key={post.id} ref={lastPostsRef} className=" flex gap-1">
                        <span>{post.id}</span>
                        <div className="mb-2">
                          {post?.title || ''}
                        </div>
                      </li>
                      
                    ))} 
                  </div>
                ))}
                <div>{isFetchingNextPage ? 'Fetching...' : null}</div> 
              </>
            )
          }
      </main>
    </div>
  );
}

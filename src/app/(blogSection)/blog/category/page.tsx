import Image from "next/image";
import Link from "next/link";

const categoryPosts = [
  {
    id: 1,
    title: "Modern Next.js Architecture Guide",
    desc: "Learn how to build scalable applications using Next.js App Router and TypeScript.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "Next.js",
    date: "May 06, 2026",
  },
  {
    id: 2,
    title: "Clean UI Design Principles",
    desc: "Simple UI techniques that make your website look premium and professional.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    category: "UI Design",
    date: "May 04, 2026",
  },
  {
    id: 3,
    title: "Advanced TypeScript Patterns",
    desc: "Improve your frontend development workflow using powerful TypeScript features.",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    category: "TypeScript",
    date: "May 02, 2026",
  },
  {
    id: 4,
    title: "Framer Motion Animation Tricks",
    desc: "Create smooth and modern website animations with Framer Motion.",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
    category: "Animation",
    date: "Apr 30, 2026",
  },
];

const categories = [
  "Next.js",
  "React",
  "UI Design",
  "TypeScript",
  "Backend",
  "Animation",
];

export default function BlogCategoryPage() {
  return (
    <main className="py-6">
      <div className="max-w-layout mx-auto px-4 bg-white border-primary-border border  rounded-lg  p-4">
        {/* Header */}
        <section className="mb-10 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="relative h-[320px] w-full">
            <Image
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
              alt="Category Banner"
              fill
              priority
              className="object-cover"
            />

            <div className="absolute inset-0 bg-black/55" />

            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
              <span className="mb-4 rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold">
                Technology Category
              </span>

              <h1 className="max-w-4xl text-4xl font-extrabold md:text-6xl">
                Modern Web Development Articles
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-200">
                Explore premium articles about Next.js, TypeScript, UI Design
                and modern frontend technologies.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mb-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:bg-blue-500 hover:text-white"
            >
              {category}
            </button>
          ))}
        </section>

        {/* Content */}
        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left */}
          <div className="space-y-8">
            {categoryPosts.map((post) => (
              <Link
                href="/"
                key={post.id}
                className="group grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[320px_1fr]"
              >
                {/* Image */}
                <div className="relative h-72 md:h-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold text-blue-600">
                      {post.category}
                    </span>

                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>

                  <h2 className="text-3xl font-bold leading-tight transition group-hover:text-blue-600">
                    {post.title}
                  </h2>

                  <p className="mt-5 text-base leading-8 text-gray-600">
                    {post.desc}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                    Read More →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Popular Posts */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-bold">Popular Posts</h3>

              <div className="space-y-5">
                {categoryPosts.slice(0, 3).map((post) => (
                  <Link href="/" key={post.id} className="group flex gap-4">
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div>
                      <h4 className="line-clamp-2 font-semibold leading-6 transition group-hover:text-blue-600">
                        {post.title}
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">{post.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xl font-bold">Tags</h3>

              <div className="flex flex-wrap gap-3">
                {[
                  "Next.js",
                  "React",
                  "Node.js",
                  "Tailwind",
                  "TypeScript",
                  "MongoDB",
                  "UI",
                  "API",
                ].map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-500 hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

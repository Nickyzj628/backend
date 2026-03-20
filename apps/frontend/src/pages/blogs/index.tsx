import type { Blog } from "@nickyzj/shared-types";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Figcaption, Figure } from "@/components/figure";
import Section from "@/components/section";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useBlogsStore } from "@/stores/blog";
import { clsx } from "@/utils/string";
import { fromNow } from "@/utils/time";

type OnPageLoaded = (pageItems: Blog[]) => void;

const Pager = ({ onLoaded }: { onLoaded: OnPageLoaded }) => {
  const { ref: pagerRef, isIntersecting } = useIntersectionObserver<HTMLButtonElement>({
    rootMargin: "500px",
  });

  const [page, setPage] = useState(1);
  const { loading, data } = useBlogsStore({ page });

  // 翻页
  useEffect(() => {
    const hasNextPage = page < (data?.totalPages ?? 0);
    if (isIntersecting && !loading && hasNextPage) {
      setPage(page + 1);
    }
  }, [isIntersecting, loading]);

  // 分页数据回调
  useEffect(() => {
    if (data) {
      onLoaded(data.list);
    }
  }, [data]);

  return <button ref={pagerRef} aria-label="下一页" className="absolute bottom-0" />;
};

const Pages = () => {
  // 全量数据
  const [fullItems, setFullItems] = useState<Blog[]>([]);
  const years = useMemo(() => {
    return Array.from(new Set(fullItems.map((item) => item.year))).toSorted((a, b) => b - a);
  }, [fullItems]);

  // 分页回调数据
  const onPageLoaded: OnPageLoaded = (pageItems) => {
    setFullItems([...fullItems, ...pageItems]);
  };

  const colors = ["text-blue-300", "text-red-300", "text-yellow-300", "text-pink-300"];

  return (
    <>
      {years.map((year, i) => {
        const yearItems = fullItems.filter((item) => item.year === year);
        const color = colors[year % colors.length];
        return (
          <Section className={clsx(i !== 0 && "mt-2")}>
            <Section.Title className={color}>{year}</Section.Title>
            <div className="relative grid flex-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
              {yearItems.map((item, index) => {
                return (
                  <a
                    key={item.title}
                    href={`/blogs/${item.slug}`}
                    className={clsx("flex aspect-4/3", index === 0 && "col-span-2 row-span-2")}
                  >
                    <Figure className="size-full">
                      <Figure.Image src={`/Blogs/${item.title}.webp`} alt={item.title} />
                      <Figcaption>
                        <Figcaption.Title className="text-base text-pretty">
                          {item.title}
                        </Figcaption.Title>
                        <Figcaption.Description>
                          {fromNow(item.created_at)}创建
                        </Figcaption.Description>
                      </Figcaption>
                    </Figure>
                  </a>
                );
              })}
            </div>
          </Section>
        );
      })}
      <Pager onLoaded={onPageLoaded} />
    </>
  );
};

export default Pages;

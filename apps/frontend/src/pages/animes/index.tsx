import type { Anime } from "@nickyzj/shared-types";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Figcaption, Figure } from "@/components/figure";
import Section from "@/components/section";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useAnimesStore } from "@/stores/anime";
import { clsx } from "@/utils/string";
import { fromNow } from "@/utils/time";

type OnPageLoaded = (pageItems: Anime[]) => void;

const Pager = ({ onLoaded }: { onLoaded: OnPageLoaded }) => {
  const { ref: pagerRef, isIntersecting } = useIntersectionObserver<HTMLButtonElement>({
    rootMargin: "500px",
  });

  const [page, setPage] = useState(1);
  const { loading, data } = useAnimesStore({ page });

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
  const [fullItems, setFullItems] = useState<Anime[]>([]);
  const seasons = useMemo(() => {
    return Array.from(new Set(fullItems.map((item) => Number(item.season)))).toSorted(
      (a, b) => b - a,
    );
  }, [fullItems]);

  // 分页回调数据
  const onPageLoaded: OnPageLoaded = (pageItems) => {
    setFullItems([...fullItems, ...pageItems]);
  };

  const colors = ["text-blue-300", "text-red-300", "text-yellow-300", "text-pink-300"];

  return (
    <>
      {seasons.map((season, i) => {
        const seasonItems = fullItems.filter((item) => Number(item.season) === season);
        const color = colors[season % colors.length];
        return (
          <Section className={clsx(i !== 0 && "mt-2")}>
            <Section.Title className={color}>{season}</Section.Title>
            <div className="grid flex-1 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-9 gap-3">
              {seasonItems.map((item) => (
                <a key={item.title} href={`/animes/${item.slug}`} className="flex aspect-2/3">
                  <Figure className="size-full">
                    <Figure.Image src={`/Animes/${item.title}.webp`} alt={item.title} />
                    <Figcaption>
                      <Figcaption.Title className="text-base text-pretty">
                        {item.title}
                      </Figcaption.Title>
                      <Figcaption.Description>共{item.eps}话</Figcaption.Description>
                      <Figcaption.Extra>{fromNow(item.updated_at)}更新</Figcaption.Extra>
                    </Figcaption>
                  </Figure>
                </a>
              ))}
            </div>
          </Section>
        );
      })}
      <Pager onLoaded={onPageLoaded} />
    </>
  );
};

export default Pages;

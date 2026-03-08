import type { Anime } from "@nickyzj/shared-types";
import dayjs from "dayjs";
import { useMemo } from "preact/hooks";
import { Figcaption, Figure } from "@/components/figure";
import Loading from "@/components/loading";
import Section from "@/components/section";
import Timeline from "@/components/timeline";
import { useAnimesStore } from "@/stores/anime";
import { clsx } from "@/utils/string";

type GroupedAnimes = (Anime & {
	dayDiff: number;
	dayDiffLocale: string;
})[][];

const DAY_DIFF_LOCALE_STRINGS = ["今天", "昨天", "前天"];

const RecentAnimes = () => {
	const { loading, error, data } = useAnimesStore();
	const { list = [] } = data ?? {};

	const dayDiffToLocaleString = (dayDiff: number) => {
		if (dayDiff >= DAY_DIFF_LOCALE_STRINGS.length) {
			return `${dayDiff}天前`;
		}
		return DAY_DIFF_LOCALE_STRINGS[dayDiff];
	};

	const groupedAnimes = useMemo<GroupedAnimes>(() => {
		if (!list.length) {
			return [];
		}

		const now = dayjs();
		return list
			.reduce((result, anime) => {
				const dayDiff = now.diff(dayjs(anime.updated_at), "day");
				if (!result[dayDiff]) {
					result[dayDiff] = [];
				}
				result[dayDiff].push({
					...anime,
					dayDiff,
					dayDiffLocale: dayDiffToLocaleString(dayDiff),
				});
				return result;
			}, [] as GroupedAnimes)
			.filter(Boolean);
	}, [list]);

	return (
		<Section className="flex flex-col flex-1 gap-1.5 min-w-72 w-full sm:w-80 lg:w-96 h-144 mt-2">
			<Section.Title className="text-yellow-300">本季新番</Section.Title>
			<div
				className={clsx(
					"relative flex flex-col flex-1 p-3 text-zinc-400 rounded-xl bg-zinc-100 overflow-x-hidden transition dark:text-zinc-500 dark:bg-zinc-800",
					groupedAnimes.length === 0 && "items-center justify-center",
				)}
			>
				{loading && <Loading />}
				{error && (
					<div className="flex flex-col items-center">
						<i className="i-mingcute-pic-line size-32" />
						<p>{error.message}</p>
					</div>
				)}
				{groupedAnimes.map((group) => (
					<Timeline key={group[0].dayDiff} time={group[0].dayDiffLocale}>
						{group.map((anime) => (
							<a
								key={anime.title}
								href={`/animes/${anime.slug}?ep=${anime.eps}`}
							>
								<Figure className="max-w-36 aspect-2/3">
									<Figure.Image
										src={`/animes/${anime.title}.webp`}
										alt={anime.title}
									/>
									<Figcaption>
										<Figcaption.Title className="text-base line-clamp-2">
											{anime.title}
										</Figcaption.Title>
										<Figcaption.Description>
											{`第${anime.eps}话`}
										</Figcaption.Description>
									</Figcaption>
								</Figure>
							</a>
						))}
					</Timeline>
				))}
			</div>
		</Section>
	);
};

export default RecentAnimes;

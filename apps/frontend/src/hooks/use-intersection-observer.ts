import { useEffect, useRef, useState } from "preact/hooks";

export const useIntersectionObserver = <T extends HTMLElement>(
	options: IntersectionObserverInit = {},
) => {
	const { threshold = 0, root = null, rootMargin = "0px" } = options ?? {};

	const ref = useRef<T>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);

	useEffect(() => {
		const { current: element } = ref;
		if (!element) {
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsIntersecting(entry.isIntersecting);
			},
			{
				threshold,
				root,
				rootMargin,
			},
		);

		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, [threshold, root, rootMargin]);

	return { ref, isIntersecting };
};

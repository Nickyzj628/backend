const Footer = () => {
	return (
		<footer className="bento flex justify-center gap-1 text-sm text-neutral-400 transition dark:text-neutral-500">
			由
			<a
				href="https://preactjs.com/"
				target="_blank"
				className="transition-none"
				rel="noopener"
			>
				Preact
			</a>
			和
			<a
				href="https://tailwindcss.com/"
				target="_blank"
				className="transition-none"
				rel="noopener"
			>
				Tailwind CSS
			</a>
			驱动
		</footer>
	);
};

export default Footer;

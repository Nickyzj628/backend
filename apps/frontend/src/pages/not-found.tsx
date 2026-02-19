import { Link } from "wouter-preact";
import Button from "@/components/button";

const NotFound = () => {
	return (
		<div class="flex flex-1 flex-col items-center justify-center gap-1.5 h-full">
			<h1 class="text-6xl font-semibold sm:text-8xl">ERROR</h1>
			<p class="text-zinc-500 dark:text-zinc-400 transition">
				您的页面好像偏离了地球...
			</p>
			<Link href="/" className="mt-4">
				<Button className="px-8">回到主页</Button>
			</Link>
		</div>
	);
};

export default NotFound;

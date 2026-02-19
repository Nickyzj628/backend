import { Suspense } from "preact/compat";
import CustomRouter from "@/components/custom-router";
import CustomToaster from "@/components/custom-toaster";
import Loading from "@/components/loading";
import TitleUpdater from "@/components/title-updater";
import Aside from "./components/aside";
import Footer from "./components/footer";
import Header from "./components/header";

const DefaultLayout = () => {
	return (
		<>
			<TitleUpdater />
			<div className="flex flex-col gap-3 min-h-screen p-3">
				<Header />
				<div className="flex flex-1 gap-3">
					<Aside />
					<main className="bento relative flex flex-1 flex-wrap items-start content-start gap-3 overflow-hidden">
						<Suspense fallback={<Loading className="size-full" />}>
							<CustomRouter />
						</Suspense>
					</main>
				</div>
				<Footer />
			</div>
			<CustomToaster />
		</>
	);
};

export default DefaultLayout;

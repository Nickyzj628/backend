import Avatar from "@/components/avatar";
import Tabs from "@/components/tabs";
import History from "./history";
import Links from "./links";
import Works from "./works";

const Page = () => {
    return (
        <>
            <div className="flex items-center gap-3 w-full">
                <Avatar name="Nickyzj" size="size-24 sm:size-28" />
                <div>
                    <span className="text-sm text-zinc-500 transition dark:text-zinc-400">nickyzj2019@qq.com</span>
                    <h1 className="my-0.5">杨智杰</h1>
                    <span className="text-sm text-zinc-500 transition dark:text-zinc-400">24岁 · JavaScript · 前端临时工</span>
                </div>
            </div>
            <Tabs
                defaultValue="history"
                className="mt-4"
            >
                <Tabs.List className="w-fit">
                    <Tabs.Trigger value="history">
                        建站史
                    </Tabs.Trigger>
                    <Tabs.Trigger value="works">
                        作品集
                    </Tabs.Trigger>
                    <Tabs.Trigger value="links">
                        友情链接
                    </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="history">
                    <History />
                </Tabs.Content>
                <Tabs.Content value="works">
                    <Works />
                </Tabs.Content>
                <Tabs.Content value="links">
                    <Links />
                </Tabs.Content>
            </Tabs>
        </>
    );
};

export default Page;

import { useEnsuredRef, useZoom } from "@/hooks/dom";
import Image from "../../components/image";
import Timeline from "../../components/timeline";

const History = () => {
    const history = [
        {
            time: "2024年",
            title: "Preact + Tailwind CSS",
            description: "在去年的基础上用Preact重构，优化了文件结构，迭代了一些实用小功能。",
            images: ["/About/History/2024.webp"],
        },
        {
            time: "2023年",
            title: "Svelte + Tailwind CSS",
            description: "经过一年的沉淀，在学习Vue、React、Svelte等前端框架后，最后一版个人网站诞生！",
            images: ["/About/History/2023.1.webp", "/About/History/2023.2.webp"],
        },
        {
            time: "2022年",
            title: "空白",
            description: "今年没有重制网站，但是做了放映室、App、商城管理系统。",
            images: [],
        },
        {
            time: "2021年",
            title: "CakePHP + CSS + MySQL",
            description: "意识到Typecho作为内容管理系统难以实现网页应用，于是在延续设计风格的同时更换了CakePHP框架。",
            images: ["/About/History/2021.1.webp", "/About/History/2021.2.webp"],
        },
        {
            time: "2020年",
            title: "Typecho + CSS + MySQL",
            description: "翻阅了酷站和怪兽模板的上百种网站设计方案后，最终使用了没有设计的设计……",
            images: ["/About/History/2020.webp"],
        },
        {
            time: "2019年",
            title: "PHP + CSS + MySQL",
            description: "参考了iPad Pro 2019官网的横向页面设计，第一版个人网站横空出世！",
            images: ["/About/History/2019.webp"],
        },
    ];

    // 图片缩放
    const [initContainerRef, containerRef] = useEnsuredRef();
    useZoom(containerRef);

    return (
        <div ref={initContainerRef}>
            {history.map((item) => (
                <Timeline
                    key={item.time}
                    time={item.time}
                >
                    <h2 className="w-full font-semibold">
                        {item.title}
                    </h2>
                    <p className="w-full text-sm text-zinc-500">
                        {item.description}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {item.images.map((image, i) => (
                            <Image
                                key={i}
                                src={image}
                                className="h-48 shadow rounded-xl"
                            />
                        ))}
                    </div>
                </Timeline>
            ))}
        </div>
    );
};

export default History;

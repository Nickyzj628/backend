import { clsx } from "@/helpers/string";
import { ComponentChildren } from "preact";
import Image from "./image";

type FigureProps = {
    className?: string;
    children: ComponentChildren;
};

type ImageProps = {
    src: string;
    alt?: string;
    className?: string;
};

type FigcaptionProps = {
    className?: string;
    children: ComponentChildren;
};

type FigcaptionTitleProps = {
    className?: string;
    children: ComponentChildren;
};

type FigcaptionDescriptionProps = {
    className?: string;
    children: ComponentChildren;
};

type FigcaptionExtraProps = {
    className?: string;
    children: ComponentChildren;
};

export const Figure = ({ className, children }: FigureProps) => {
    return (
        <div className={clsx("group/figure relative rounded-xl overflow-hidden transition hover:scale-[0.98]", className)}>
            {children}
        </div>
    );
};

const FigureImage = ({ src, alt, className }: ImageProps) => {
    return (
        <Image
            src={src}
            alt={alt}
            className={clsx("size-full bg-neutral-200 group-hover/figure:scale-110 dark:bg-neutral-800", className)}
        />
    )
};

export const Figcaption = ({ className, children }: FigcaptionProps) => {
    return (
        <div className={clsx("absolute bottom-0 left-0 w-full pt-8 pb-3 px-3 bg-gradient-to-t from-black to-transparent", className)}>
            {children}
        </div>
    );
};

const FigcaptionTitle = ({ className, children }: FigcaptionTitleProps) => {
    return (
        <h3 className={clsx("text-white dark:text-neutral-200", className)}>
            {children}
        </h3>
    );
};

const FigcaptionDescription = ({ className, children }: FigcaptionDescriptionProps) => {
    return (
        <p className={clsx("mt-1 text-sm text-neutral-100 transition dark:text-neutral-300", className)}>
            {children}
        </p>
    );
};

const FigcaptionExtra = ({ className, children }: FigcaptionExtraProps) => {
    return (
        <p className={clsx("opacity-0 h-0 text-sm text-neutral-100 transition-all group-hover/figure:h-4 group-hover/figure:opacity-100 dark:text-neutral-300", className)}>
            {children}
        </p>
    );
};

Figure.Image = FigureImage;
Figure.Figcaption = Figcaption;

Figcaption.Title = FigcaptionTitle;
Figcaption.Description = FigcaptionDescription;
Figcaption.Extra = FigcaptionExtra;
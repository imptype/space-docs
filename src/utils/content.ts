import { NAV_TREE, docsSectionsOrder, manualSectionsOrder, migrationSectionsOrder } from "@/config";
import type { MarkdownInstance, MarkdownHeading } from "astro";
import { getCollection } from "astro:content";
import { pascalCase } from "scule";

export type AstroPage = MarkdownInstance<Record<string, any>>;

export type Page = {
  title: string;
  path: string;
  fileUrl: string;
  filename: string;
  locale: string;
  isDraft: boolean;
  isHidden: boolean;
  sections: string[];
  headings: MarkdownHeading[];
  frontmatter: AstroPage["frontmatter"];
};

export type PageItem = {
  title: string;
  link: string;
  keywords: string[];
  position?: number;
};

export type SectionItem = {
  title: string;
  position?: number;
  children: (SectionItem | PageItem)[];
};

export type SearchHit = {
  hierarchy_radio_lvl0: string;
  hierarchy_radio_lvl1: string;
  hierarchy_radio_lvl2: string;
  hierarchy_radio_lvl3: string;
  hierarchy_lvl0: string;
  hierarchy_lvl1: string;
  hierarchy_lvl2: string;
  hierarchy_lvl3: string;
  hierarchy_lvl4: string;
  hierarchy_lvl5: string;
  hierarchy_lvl6: string;
  content: string;
  objectID: string;
  url: string;
};

export const extractKeywords = (str: string) =>
  str
    .split(",")
    .map((val) => val.trim())
    .filter((val) => val !== "");

export const generateTitle = (path: string) => path.split(/[\s-]/g).map(pascalCase).join(" ");

export const removeTrailingSlash = (path: string) => path.replace(/\/+$/, "");

export const parsePages = (files: AstroPage[]) => {
  const defaultLocale = "en";
  const locales = ["en"];

  const pages: Page[] = files.map((post) => {
    // url will have the format: /docs/...
    const parts =
      post?.url
        ?.split("/")
        .slice(2, -1)
        .filter((v) => v) || [];
    const locale = locales.includes(parts[0]) ? parts.shift() || defaultLocale : defaultLocale;

    const headings = post.getHeadings();
    const filename = post.file.split("/").pop() || "";
    const extension = filename.split(".").pop() || "";
    const title = post.frontmatter.title
      ? post.frontmatter.title
      : generateTitle(filename.replace(`.${extension}`, ""));
    const isDraft = post.frontmatter.draft === true;
    const isHidden = post.frontmatter.hidden === true;

    const sections = parts.map((part) => generateTitle(part));

    return {
      frontmatter: post.frontmatter,
      path: removeTrailingSlash(post.url || ""),
      fileUrl: post.file,
      isDraft,
      isHidden,
      title,
      headings,
      filename,
      locale,
      sections
    };
  });

  const filtered = pages.filter((page) => !page.isDraft && !page.isHidden);
  return filtered;
};

export const parseSections = (pages: Page[]) => {
  let result: SectionItem[] = [];

  const isMigration = pages[0].path.startsWith("/migration");
  const isManual = pages[1].path.startsWith("/manual");

  pages.forEach((page) => {
    const keywords = new Set<string>();

    // Keywords
    const extractedKeywords = page?.frontmatter?.keywords
      ? extractKeywords(page.frontmatter.keywords)
      : [];
    extractedKeywords.forEach((keyword) => keywords.add(keyword));

    // Headings
    page.headings.forEach((heading) => {
      if (heading.text) keywords.add(heading.text.toLowerCase());
    });

    const sections = page.sections;
    const pageItem: PageItem = {
      title: page.title,
      link: page.path,
      position: page.frontmatter.position,
      keywords: [...keywords]
    };

    if (sections.length <= 1) {
      const section = sections[0] || "Overview";

      const existingIdx = result.findIndex((val) => val?.title === section);
      if (existingIdx !== -1) {
        if (result[existingIdx]?.children?.length) {
          result[existingIdx].children.push(pageItem);
        } else {
          result[existingIdx].children = [pageItem];
        }
      } else {
        result.push({
          title: section,
          children: [pageItem]
        });
      }
    } else if (sections.length === 2) {
      const existingIdx = result.findIndex((val) => val?.title === sections[0]);
      if (existingIdx !== -1) {
        if (result[existingIdx]?.children?.length) {
          const existingChildIndex = result[existingIdx].children.findIndex(
            (val) => val?.title === sections[1]
          );
          if (existingChildIndex !== -1) {
            if ((result[existingIdx].children[existingChildIndex] as any).children === undefined) {
              console.log(`[parsing]: conflicting page title with section title: "${sections[1]}"`);
              return;
            } else {
              (result[existingIdx].children[existingChildIndex] as SectionItem).children.push(
                pageItem
              );
            }

            return;
          } else {
            result[existingIdx].children.push({
              title: sections[1],
              position: Infinity,
              children: [pageItem]
            });
          }
        } else {
          result[existingIdx].children = [
            {
              title: sections[1],
              position: -1,
              children: [pageItem]
            }
          ];
        }
      } else {
        result.push({
          title: sections[0],
          children: [
            {
              title: sections[1],
              position: Infinity, // todo get section position from filename
              children: [pageItem]
            }
          ]
        });
      }
    }
  });

  // Sort sections
  if (isMigration) {
    result = result.sort((a: any, b: any) => {
      return migrationSectionsOrder.indexOf(a.title) - migrationSectionsOrder.indexOf(b.title);
    });
  } else if (isManual) {
    result = result.sort((a: any, b: any) => {
      return manualSectionsOrder.indexOf(a.title) - manualSectionsOrder.indexOf(b.title);
    });
  } else {
    result = result.sort((a: any, b: any) => {
      return docsSectionsOrder.indexOf(a.title) - docsSectionsOrder.indexOf(b.title);
    });
  }

  // Sort pages by position
  result.forEach((section) => {
    section.children = section.children.sort((a, b) => {
      return (a as any).position - (b as any).position;
    });

    section.children.forEach((child) => {
      if ("children" in child) {
        child.children = child.children.sort((a, b) => {
          return (a as any).position - (b as any).position;
        });
      }
    });
  });

  return result;
};

// Example: getting_started_1662902834
export const generateActionId = (str: string) =>
  `${str?.toLowerCase()?.replace(/ /g, "_")}_${Date.now() + Math.random()}`;


export function stripFileExtension(str: string) {
  return str.split(".").slice(0, -1).join(".");
}

export type NavigationItem = {
  name: string;
  path: string;
  prev: NavigationItem | null;
  next: NavigationItem | null;
  content: (string | NavigationItem)[];
};

//export type ManifestSection = { [key: string]: Array<string | ManifestSection> };

const pages = await getCollection("docs");
const BASE_URL ="/docs/en"; // TODO!: REMOVE, only tmp

function pathifyName(name: string) {
    return name.toLowerCase().replaceAll(" ", "-");
}

type ManifestItem = {
    name: string;
    content: (string | ManifestItem)[];
};
export function parseManifestItem(
    item: ManifestItem,
    navItem: NavigationItem
): NavigationItem {
    if (!navItem) navItem = { name: "root", path: "", prev: null, next: null, content: [] };

    for (let contentItem of item.content) {
        if (typeof contentItem === "string") {
          // Page -> Find page file
          //console.log(pages.map(e => e.id));
          const page = pages.find((e) => "/" + e.id === navItem.path + "/" + contentItem);
          if (!page) throw new Error("Could not find page for manifest item @ " + navItem.path + "/" + contentItem);
          navItem.content.push({
            // TODO: Fix types
            name: page.data.title || stripFileExtension(contentItem), //item,
            path: navItem.path + "/" + stripFileExtension(contentItem),
            prev: null,
            next: null,
            //page,
            content: []
          });
        }
        else {
            const subItem = parseManifestItem(contentItem, {
              // TODO: Fix type error
              name: pascalCase(contentItem.name),
              path: navItem.path + "/" + pathifyName(contentItem.name),
              prev: null,
              next: null,
              content: []
            });
            navItem.content.push(subItem);
        }
    }

    return navItem;
}

export function parseManifestSectionOLD(
  section: ManifestSection,
  navItem: NavigationItem
): NavigationItem {
  if (!navItem) navItem = { title: "root", path: "", subItems: [] };

  if (Array.isArray(section)) {
    section.forEach((item) => {
      if (typeof item === "string") {
        // Page -> Find page file
        const page = pages.find((e) => "/" + e.id === navItem.path + "/" + item);
        /*pages.forEach(e => {
                    console.log("PID : ", e.id);
                    console.log("PHREF: ", navItem.href + "/" + item);
                })*/
        if (!page) throw new Error("Could not find page for manifest item @ " + navItem.path + "/" + item);

        navItem.subItems.push({
          // TODO: Fix types
          title: page.data.title, //item,
          path: BASE_URL + navItem.path + "/" + stripFileExtension(item),
          //page,
          subItems: []
        });
      } else parseManifestSection(item, navItem);
    });
  } else {
    for (let item of Object.keys(section)) {
      navItem.subItems.push(
        parseManifestSection(section[item], { // TODO: Fix type error
          title: pascalCase(item),
          path: navItem.path + "/" + item,
          subItems: []
        })
      );
    }
  }
  return navItem;
}

/*export type ManifestItem = { name: string, content: (string | ManifestItem)[] };
export type ParsedManifestItem = { name: string; path: string, content: (string | ManifestItem)[], prev?: ParsedManifestItem, next?: ParsedManifestItem };

export function parseManifest(manifest: ManifestItem): ManifestItem {
    let parsed: ParsedManifestItem = {
        name: manifest.name,
        path: "/",
        content: [],
        prev: undefined,
        next: undefined
    };
    let active = manifest;

    function parseSection(parent: ParsedManifestItem, section: ManifestItem): ParsedManifestItem {

    }
    p

    return parsed;
}*/

interface PageStructure {
  [key: string]: (string | PageStructure)[];
}

interface LookupMap {
  [filename: string]: { prev: string | null; next: string | null };
}

export function generateLookupMap(structure: PageStructure, parentKey?: string): LookupMap {
  const lookupMap: LookupMap = {};

  function getLastPage(pages: (string | PageStructure)[]): string | null {
    const lastPage = pages[pages.length - 1];
    if (typeof lastPage === "string") {
      return lastPage;
    } else {
      const keys = Object.keys(lastPage);
      const lastKey = keys[keys.length - 1];
      return getLastPage(lastPage[lastKey] as (string | PageStructure)[]);
    }
  }

  function traverse(pages: (string | PageStructure)[], parentKey?: string) {
    let prevPage: string | null = null;
    let firstPage: string | null = null;

    for (const page of pages) {
      if (typeof page === "string") {
        if (prevPage !== null) {
          lookupMap[page] = { prev: prevPage, next: null };
          if (lookupMap[prevPage]) lookupMap[prevPage].next = page;
        }
        prevPage = page;
        if (firstPage === null) {
          firstPage = page;
        }
      } else {
        const keys = Object.keys(page);
        const currentKey = keys[0];
        const currentPages = page[currentKey] as (string | PageStructure)[];

        if (prevPage !== null) {
          lookupMap[currentKey] = { prev: prevPage, next: null };
          if (lookupMap[prevPage]) lookupMap[prevPage].next = currentKey;
        }

        traverse(currentPages, currentKey);
        prevPage = getLastPage(currentPages);
        if (firstPage === null) {
          firstPage = getLastPage(currentPages) || currentKey;
        }
      }
    }

    if (parentKey && prevPage !== null) {
      if (lookupMap[parentKey]) lookupMap[parentKey].next = firstPage;
    }
  }

  for (const key of Object.keys(structure)) {
    const pages = structure[key];
    traverse(pages, key);
  }

  return lookupMap;
}

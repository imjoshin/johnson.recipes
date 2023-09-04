const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");
const { getGatsbyImageResolver } = require("gatsby-plugin-image/graphql-utils");
const { default: slugify } = require("slugify");
import { getSlug } from "./src/util";
import path from "path";

exports.createSchemaCustomization = async ({ actions }) => {
  actions.createFieldExtension({
    name: "blocktype",
    extend(options) {
      return {
        resolve(source) {
          return source.internal.type.replace("Contentful", "");
        },
      };
    },
  });

  actions.createFieldExtension({
    name: "imagePassthroughArgs",
    extend(options) {
      const { args } = getGatsbyImageResolver();
      return {
        args,
      };
    },
  });

  actions.createFieldExtension({
    name: "imageUrl",
    extend(options) {
      const schemaRE = /^\/\//;
      const addURLSchema = (str) => {
        if (schemaRE.test(str)) return `https:${str}`;
        return str;
      };
      return {
        resolve(source) {
          return addURLSchema(source.file.url);
        },
      };
    },
  });

  actions.createFieldExtension({
    name: "navItemType",
    args: {
      name: {
        type: "String!",
        defaultValue: "Link",
      },
    },
    extend(options) {
      return {
        resolve() {
          switch (options.name) {
            case "Group":
              return "Group";
            default:
              return "Link";
          }
        },
      };
    },
  });

  actions.createFieldExtension({
    name: "richText",
    extend(options) {
      return {
        resolve(source, args, context, info) {
          const body = source.body;
          const doc = JSON.parse(body.raw);
          const html = documentToHtmlString(doc);
          return html;
        },
      };
    },
  });

  // abstract interfaces
  actions.createTypes(/* GraphQL */ `
    interface HomepageBlock implements Node {
      id: ID!
      blocktype: String
    }

    interface HomepageLink implements Node {
      id: ID!
      href: String
      text: String
    }

    interface HeaderNavItem implements Node {
      id: ID!
      navItemType: String
    }

    interface NavItem implements Node & HeaderNavItem {
      id: ID!
      navItemType: String
      href: String
      text: String
      icon: HomepageImage
      description: String
    }

    interface NavItemGroup implements Node & HeaderNavItem {
      id: ID!
      navItemType: String
      name: String
      navItems: [NavItem]
    }

    interface HomepageImage implements Node {
      id: ID!
      alt: String
      gatsbyImageData: GatsbyImageData @imagePassthroughArgs
      url: String
    }

    interface HomepageHero implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      heading: String!
      kicker: String
      subhead: String
      image: HomepageImage
      text: String
      links: [HomepageLink]
    }

    interface Homepage implements Node {
      id: ID!
      title: String
      description: String
      image: HomepageImage
      content: [HomepageBlock]
    }

    interface LayoutHeader implements Node {
      id: ID!
      navItems: [HeaderNavItem]
      cta: HomepageLink
    }

    enum SocialService {
      TWITTER
      FACEBOOK
      INSTAGRAM
      YOUTUBE
      LINKEDIN
      GITHUB
      DISCORD
      TWITCH
    }

    interface SocialLink implements Node {
      id: ID!
      username: String!
      service: SocialService!
    }

    interface LayoutFooter implements Node {
      id: ID!
      links: [HomepageLink]
      meta: [HomepageLink]
      socialLinks: [SocialLink]
      copyright: String
    }

    interface Layout implements Node {
      id: ID!
      header: LayoutHeader
      footer: LayoutFooter
    }

    interface Page implements Node {
      id: ID!
      slug: String!
      title: String
      description: String
      image: HomepageImage
      html: String!
    }

    interface Creator implements Node {
      id: ID!
      name: String!
      avatar: HomepageImage
      bio: String
    }

    interface Recipe implements Node {
      id: ID!
      title: String!
      description: String
      image: HomepageImage
      ingredients: String
      preparationTime: Int
      cookingTime: Int
      totalTime: Int
      servings: Int
      calories: Int
      tags: [String]
      creator: Creator
    }

    interface RecipeGroup implements Node & HomepageBlock {
      id: ID!
      blocktype: String
      name: String!
      recipes: [Recipe]
    }
  `);

  // CMS-specific types for Homepage
  actions.createTypes(/* GraphQL */ `
    type ContentfulHomepageLink implements Node & HomepageLink @dontInfer {
      id: ID!
      href: String
      text: String
    }

    type ContentfulNavItem implements Node & NavItem & HeaderNavItem
      @dontInfer {
      id: ID!
      navItemType: String @navItemType(name: "Link")
      href: String
      text: String
      icon: HomepageImage @link(from: "icon___NODE")
      description: String
    }

    type ContentfulNavItemGroup implements Node & NavItemGroup & HeaderNavItem
      @dontInfer {
      id: ID!
      navItemType: String @navItemType(name: "Group")
      name: String
      navItems: [NavItem] @link(from: "navItems___NODE")
    }

    type ContentfulAsset implements Node & HomepageImage {
      id: ID!
      alt: String @proxy(from: "title")
      gatsbyImageData: GatsbyImageData
      url: String @imageUrl
      file: JSON
      title: String
    }

    type ContentfulHomepageHero implements Node & HomepageHero & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      heading: String!
      kicker: String
      subhead: String
      image: HomepageImage @link(from: "image___NODE")
      text: String
      links: [HomepageLink] @link(from: "links___NODE")
    }

    type ContentfulHomepage implements Node & Homepage @dontInfer {
      id: ID!
      title: String
      description: String
      image: HomepageImage @link(from: "image___NODE")
      content: [HomepageBlock] @link(from: "content___NODE")
    }

    type ContentfulRecipeGroup implements Node & RecipeGroup & HomepageBlock
      @dontInfer {
      id: ID!
      blocktype: String @blocktype
      name: String!
      recipes: [Recipe] @link(from: "recipes___NODE")
    }

    type ContentfulRecipe implements Node & Recipe
      @dontInfer {
      id: ID!
      title: String!
      description: String
      image: HomepageImage @link(from: "image___NODE")
      ingredients: String
      preparationTime: Int
      cookingTime: Int
      totalTime: Int
      servings: Int
      calories: Int
      tags: [String]
      creator: Creator
    }

    type ContentfulCreator implements Node & Creator
      @dontInfer {
      id: ID!
      name: String!
      avatar: HomepageImage @link(from: "image___NODE")
      bio: String
    }
  `);

  // Layout types
  actions.createTypes(/* GraphQL */ `
    type ContentfulLayoutHeader implements Node & LayoutHeader @dontInfer {
      id: ID!
      navItems: [HeaderNavItem] @link(from: "navItems___NODE")
      cta: HomepageLink @link(from: "cta___NODE")
    }

    type ContentfulSocialLink implements Node & SocialLink @dontInfer {
      id: ID!
      username: String!
      service: SocialService!
    }

    type ContentfulLayoutFooter implements Node & LayoutFooter @dontInfer {
      id: ID!
      links: [HomepageLink] @link(from: "links___NODE")
      meta: [HomepageLink] @link(from: "meta___NODE")
      socialLinks: [SocialLink] @link(from: "socialLinks___NODE")
      copyright: String
    }

    type ContentfulLayout implements Node & Layout @dontInfer {
      id: ID!
      header: LayoutHeader @link(from: "header___NODE")
      footer: LayoutFooter @link(from: "footer___NODE")
    }
  `);

  // Page types
  actions.createTypes(/* GraphQL */ `
    type ContentfulPage implements Node & Page {
      id: ID!
      slug: String!
      title: String
      description: String
      image: HomepageImage @link(from: "image___NODE")
      html: String! @richText
    }
  `);
};

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allContentfulRecipe {
        nodes {
          id
          title
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your recipes`,
      result.errors
    );
    return;
  }

  const recipes = result.data.allContentfulRecipe.nodes;
  const recipe = path.resolve("./src/templates/recipe.js");

  // Create blog posts pages
  // But only if there's at least one markdown file found at "content/blog" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (recipes.length > 0) {

    recipes.forEach(({ title, id }, index) => {
      const slug = getSlug(title);

      const previousId = index === 0 ? null : recipes[index - 1].id;
      const nextId = index === recipes.length - 1 ? null : recipes[index + 1].id;

      reporter.info(`Created /${slug}`);
      createPage({
        path: `/${slug}`,
        component: recipe,
        context: {
          id,
          previousId,
          nextId,
        },
      });
    });
  }
};
